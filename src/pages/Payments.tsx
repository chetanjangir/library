import React, { useState, useEffect, useRef } from 'react';
import { IndianRupee, Search, X, History, ChevronLeft, ChevronRight, TrendingUp, Wallet, AlertCircle } from 'lucide-react';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { computeDueInfo } from '../utils/dues';
import DuesTable from '../components/payments/DuesTable';
import PaymentHistoryModal from '../components/students/PaymentHistoryModal';
import type { Student } from '../types';

const PAGE_SIZE = 20;

interface LedgerEntry {
  id: string;
  studentId: string;
  studentName: string;
  seatNumber?: number | null;
  currency: string;
  date: string;
  amount: number;
  type: 'payment' | 'advance';
  note?: string | null;
}

function Payments() {
  const { isAdmin, user } = useAuth();
  const admin = isAdmin();

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const { toasts, removeToast, showError } = useToast();

  const [activeTab, setActiveTab] = useState<'paid' | 'dues'>('paid');

  // Ledger (Paid tab) - admin sees every student's ledger, paginated & filtered
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'payment' | 'advance'>('all');
  const [durationFilter, setDurationFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const filterKey = JSON.stringify({ debouncedSearch, typeFilter, durationFilter });
  const prevFilterKey = useRef(filterKey);

  const getDurationRange = (): { dateFrom?: string; dateTo?: string } => {
    if (durationFilter === 'all') return {};
    const now = new Date();
    let start: Date;
    if (durationFilter === 'week') {
      const day = now.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
    } else if (durationFilter === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
    }
    return { dateFrom: start.toISOString().split('T')[0], dateTo: now.toISOString().split('T')[0] };
  };

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      setError(null);
      const data = await apiService.getStudents();
      if (admin) {
        setStudents(data);
      } else {
        const currentStudent = data.find((s: Student) => s.id === user?.studentId);
        setStudents(currentStudent ? [currentStudent] : []);
      }
    } catch (err) {
      setError('Failed to load students. Please check your database connection.');
      console.error('Error loading students:', err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Admin: paginated + filtered ledger from the server
  const loadEntriesPage = async () => {
    if (!admin) return;
    try {
      setLoadingEntries(true);
      const { dateFrom, dateTo } = getDurationRange();
      const result = await apiService.getLedgerPaged({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        type: typeFilter,
        dateFrom,
        dateTo
      });
      setEntries(result.entries);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Error loading payment ledger:', err);
      setEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!admin) {
      setLoadingEntries(false);
      return;
    }
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }
    loadEntriesPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterKey]);

  // Auto-refresh every 30 seconds so payments recorded elsewhere (Students
  // list, Student form, Dues page) show up here without a manual reload.
  useEffect(() => {
    const interval = setInterval(() => {
      loadStudents();
      if (admin) loadEntriesPage();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshAll = async () => {
    await loadStudents();
    if (admin) await loadEntriesPage();
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols = { USD: '$', EUR: '€', INR: '₹', GBP: '£' };
    return symbols[currency as keyof typeof symbols] || currency;
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDurationFilter('all');
  };

  const activeFiltersCount = [
    searchTerm,
    typeFilter !== 'all' ? typeFilter : null,
    durationFilter !== 'all' ? durationFilter : null
  ].filter(Boolean).length;

  // Summary stats, derived straight from each student's payment ledger - the
  // same data every "Record Payment" action writes to, so this is always in
  // sync with what students actually paid/owe.
  const totalPaid = students.reduce(
    (sum, s) => sum + (s.paymentHistory || []).filter(p => p.type === 'payment').reduce((a, p) => a + (p.amount || 0), 0),
    0
  );
  const totalAdvance = students.reduce(
    (sum, s) => sum + (s.paymentHistory || []).filter(p => p.type === 'advance').reduce((a, p) => a + (p.amount || 0), 0),
    0
  );
  const totalDue = students
    .filter(s => s.status !== 'inactive')
    .reduce((sum, s) => sum + computeDueInfo(s).due, 0);

  const findStudent = (studentId: string): Student | undefined => students.find(s => s.id === studentId);

  // Non-admin: just their own ledger entries, most recent first - no need for
  // pagination or filters on a single student's history.
  const ownEntries: LedgerEntry[] = !admin
    ? (students[0]?.paymentHistory || [])
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(p => ({
        id: p.id,
        studentId: students[0].id,
        studentName: students[0].name,
        seatNumber: students[0].seatNumber,
        currency: students[0].currency,
        date: p.date,
        amount: p.amount,
        type: p.type,
        note: p.note
      }))
    : [];

  const visibleEntries = admin ? entries : ownEntries;
  const loading = loadingStudents && students.length === 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading payments...</div>
      </div>
    );
  }

  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const rangeEnd = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {admin ? 'Payments' : 'My Payments'}
        </h1>
        <button
          onClick={refreshAll}
          className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          title="Refresh"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <IndianRupee className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalPaid.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Wallet className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Advance</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalAdvance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Due</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalDue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('paid')}
            className={`flex items-center gap-1.5 py-3 px-1 border-b-2 text-sm font-medium ${
              activeTab === 'paid'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Paid
          </button>
          <button
            onClick={() => setActiveTab('dues')}
            className={`flex items-center gap-1.5 py-3 px-1 border-b-2 text-sm font-medium ${
              activeTab === 'dues'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Dues
            {totalDue > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                ₹{totalDue.toFixed(0)}
              </span>
            )}
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'dues' ? (
          <DuesTable
            students={students}
            onChanged={refreshAll}
            onShowHistory={setHistoryStudent}
            showSearch={admin}
          />
        ) : (
          <>
            {/* Filters (admin only) */}
            {admin && (
              <div className="mb-6 bg-white rounded-lg shadow-sm p-4 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-red-600 hover:text-red-800 flex items-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear all ({activeFiltersCount})
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by student name..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                    >
                      <option value="all">Payment & Advance</option>
                      <option value="payment">Payment only</option>
                      <option value="advance">Advance only</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      value={durationFilter}
                      onChange={(e) => setDurationFilter(e.target.value as typeof durationFilter)}
                    >
                      <option value="all">Any Time</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              {visibleEntries.length === 0 ? (
                <div className="text-center py-12">
                  <IndianRupee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {admin ? 'No Payments Found' : 'No Payment History'}
                  </h3>
                  <p className="text-gray-500">
                    {admin
                      ? (activeFiltersCount > 0 ? 'No payments match the current filters.' : 'Payments recorded for any student will appear here automatically.')
                      : 'Your payment history will appear here once payments are recorded.'
                    }
                  </p>
                </div>
              ) : (
                <>
                  {admin && (
                    <div className="px-6 py-3 border-b border-gray-200 text-sm text-gray-600 flex items-center justify-between">
                      <span>
                        {pagination.total === 0
                          ? 'No payments found'
                          : `Showing ${rangeStart}-${rangeEnd} of ${pagination.total} payments`}
                        {loadingEntries && <span className="ml-2 text-xs text-gray-400">Loading...</span>}
                      </span>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {visibleEntries.map((entry) => (
                          <tr key={entry.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{entry.studentName || 'Unknown Student'}</div>
                              {entry.seatNumber ? (
                                <div className="text-xs text-gray-500">Seat {entry.seatNumber}</div>
                              ) : null}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  entry.type === 'advance' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {entry.type === 'advance' ? 'Advance' : 'Payment'}
                              </span>
                              {entry.note && <div className="text-xs text-gray-400 mt-1">{entry.note}</div>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {getCurrencySymbol(entry.currency || 'INR')}{(entry.amount || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  const student = findStudent(entry.studentId);
                                  if (student) {
                                    setHistoryStudent(student);
                                  } else {
                                    showError('Not Available', 'No linked student record was found for this payment.');
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Payment History (past & upcoming dues)"
                              >
                                <History className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {admin && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={pagination.page <= 1}
                        className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={pagination.page >= pagination.totalPages}
                        className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {historyStudent && (
        <PaymentHistoryModal student={historyStudent} onClose={() => setHistoryStudent(null)} />
      )}
    </div>
  );
}

export default Payments;
