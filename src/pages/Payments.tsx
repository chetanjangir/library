import React, { useState, useEffect, useRef } from 'react';
import { Plus, IndianRupee, Edit, Search, X, History, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import PaymentForm from '../components/payments/PaymentForm';
import PaymentHistoryModal from '../components/students/PaymentHistoryModal';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Payment, Student } from '../types';

const PAGE_SIZE = 20;

function Payments() {
  const { isAdmin, user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]); // unpaginated, used only for the summary cards
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Filters (admin view only - the student view stays a small, unfiltered list)
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [planTypeFilter, setPlanTypeFilter] = useState<'all' | 'daily' | 'monthly' | 'yearly'>('all');
  const [durationFilter, setDurationFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const filterKey = JSON.stringify({ debouncedSearch, statusFilter, planTypeFilter, durationFilter });
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

  // Load student-scoped, unfiltered data once (used for the form dropdown,
  // per-row payment history/upcoming dues, and - for the student view - the
  // whole (small) payments list).
  const loadStudentsAndStats = async () => {
    try {
      const [studentsData, allPaymentsData] = await Promise.all([
        apiService.getStudents(),
        apiService.getPayments()
      ]);

      if (isAdmin()) {
        setStudents(studentsData);
        setAllPayments(allPaymentsData);
      } else {
        const currentStudent = studentsData.find((s: Student) => s.id === user?.studentId);
        const studentPayments = allPaymentsData.filter((p: Payment) => p.studentId === user?.studentId);
        setStudents(currentStudent ? [currentStudent] : []);
        setAllPayments(studentPayments);
        setPayments(studentPayments);
      }
    } catch (err) {
      console.error('Error loading students/stats:', err);
    }
  };

  // Load a single page of payments matching the current filters (admin view only)
  const loadPaymentsPage = async () => {
    if (!isAdmin()) return;
    try {
      setLoading(true);
      setError(null);
      const { dateFrom, dateTo } = getDurationRange();
      const result = await apiService.getPaymentsPaged({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        status: statusFilter,
        planType: planTypeFilter,
        dateFrom,
        dateTo
      });
      setPayments(result.payments);
      setPagination(result.pagination);
    } catch (err) {
      setError('Failed to load payments. Please check your database connection.');
      console.error('Error loading payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadStudentsAndStats().finally(() => {
      if (!isAdmin()) setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAdmin()) return;
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }
    loadPaymentsPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterKey]);

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadStudentsAndStats();
      if (isAdmin()) loadPaymentsPage();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshAll = async () => {
    await loadStudentsAndStats();
    if (isAdmin()) await loadPaymentsPage();
  };

  const handleAddPayment = async (paymentData: Omit<Payment, 'id'>) => {
    if (!isAdmin()) {
      alert('Only administrators can modify payments');
      return;
    }

    try {
      if (editingPayment) {
        await apiService.updatePayment(editingPayment.id, paymentData);
      } else {
        await apiService.createPayment(paymentData);
      }

      await refreshAll();
      setShowForm(false);
      setEditingPayment(null);

      showSuccess(
        `Payment ${editingPayment ? 'Updated' : 'Added'}`,
        `Payment ${editingPayment ? 'updated' : 'added'} successfully!`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${editingPayment ? 'update' : 'add'} payment`;
      setError(errorMessage);
      showError('Operation Failed', errorMessage);
      console.error('Error saving payment:', err);
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    if (!isAdmin()) {
      showError('Access Denied', 'Only administrators can modify payment status');
      return;
    }

    try {
      const payment = allPayments.find(p => p.id === paymentId) || payments.find(p => p.id === paymentId);
      if (!payment) return;

      const updateData = {
        ...payment,
        status: 'paid',
        paidDate: new Date().toISOString()
      };

      await apiService.updatePayment(paymentId, updateData);

      if (payment.studentId) {
        const student = students.find(s => s.id === payment.studentId);
        if (student) {
          const studentUpdateData = {
            ...student,
            paymentStatus: 'paid',
            paidAmount: payment.amount,
            balanceAmount: 0
          };
          await apiService.updateStudent(payment.studentId, studentUpdateData);
        }
      }

      await refreshAll();
      showSuccess('Payment Updated', 'Payment marked as paid successfully!');
    } catch (err) {
      showError('Update Failed', 'Failed to update payment status');
      console.error('Error updating payment:', err);
    }
  };

  const handleEditPayment = (payment: Payment) => {
    if (!isAdmin()) {
      showError('Access Denied', 'Only administrators can edit payments');
      return;
    }
    setEditingPayment(payment);
    setShowForm(true);
  };

  const handleDeletePayment = async (payment: Payment) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    try {
      await apiService.deletePayment(payment.id);
      await refreshAll();
      showSuccess('Payment Deleted', 'Payment deleted successfully!');
    } catch (err) {
      showError('Delete Failed', 'Failed to delete payment');
      console.error('Error deleting payment:', err);
    }
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols = { USD: '$', EUR: '€', INR: '₹', GBP: '£' };
    return symbols[currency as keyof typeof symbols] || currency;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending':
      case 'due': return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPlanTypeFilter('all');
    setDurationFilter('all');
  };

  const activeFiltersCount = [
    searchTerm,
    statusFilter !== 'all' ? statusFilter : null,
    planTypeFilter !== 'all' ? planTypeFilter : null,
    durationFilter !== 'all' ? durationFilter : null
  ].filter(Boolean).length;

  // Calculate payment statistics from the full (unfiltered, unpaginated) set
  const totalPending = allPayments
    .filter(p => p && (p.status === 'pending' || p.status === 'due'))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalOverdue = allPayments
    .filter(p => p && (p.status === 'overdue' || p.status === 'expired'))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalPaid = allPayments
    .filter(p => p && p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const findStudentForPayment = (payment: Payment): Student | undefined =>
    students.find(s => s.id === payment.studentId) || students.find(s => s.name === payment.studentName);

  if (loading && payments.length === 0) {
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
          {isAdmin() ? 'Payments Management' : 'My Payments'}
        </h1>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={refreshAll}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
          {isAdmin() && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Payment
            </Button>
          )}
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <IndianRupee className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-semibold text-gray-900">₹{(totalPaid || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <IndianRupee className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Due</p>
              <p className="text-2xl font-semibold text-gray-900">₹{(totalPending || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <IndianRupee className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">₹{(totalOverdue || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters (admin only) */}
      {isAdmin() && !showForm && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4 space-y-4">
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={planTypeFilter}
                onChange={(e) => setPlanTypeFilter(e.target.value as typeof planTypeFilter)}
              >
                <option value="all">All Plans</option>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date Duration</label>
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

      <div className="mt-6">
        {showForm && isAdmin() ? (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">
              {editingPayment ? 'Edit Payment' : 'Add New Payment'}
            </h2>
            <PaymentForm
              students={students}
              onSubmit={handleAddPayment}
              onCancel={() => {
                setShowForm(false);
                setEditingPayment(null);
              }}
              editingPayment={editingPayment}
            />
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <IndianRupee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isAdmin() ? 'No Payments Found' : 'No Payment History'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {isAdmin()
                    ? (activeFiltersCount > 0 ? 'No payments match the current filters.' : 'Payments are automatically generated when students are added.')
                    : 'Your payment history will appear here once payments are processed.'
                  }
                </p>
                {isAdmin() && activeFiltersCount === 0 && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Manual Payment
                  </Button>
                )}
              </div>
            ) : (
              <>
                {isAdmin() && (
                  <div className="px-6 py-3 border-b border-gray-200 text-sm text-gray-600 flex items-center justify-between">
                    <span>
                      {pagination.total === 0
                        ? 'No payments found'
                        : `Showing ${rangeStart}-${rangeEnd} of ${pagination.total} payments`}
                      {loading && <span className="ml-2 text-xs text-gray-400">Loading...</span>}
                    </span>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.filter(p => p && p.id).map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.studentName || 'Unknown Student'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getCurrencySymbol(payment.currency || 'INR')}{(payment.amount || 0).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 capitalize">{payment.planType}</div>
                            <div className="text-xs text-gray-500 capitalize">{payment.dayType} day</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'N/A'}
                            </div>
                            {payment.paidDate && (
                              <div className="text-xs text-gray-500">
                                Paid: {new Date(payment.paidDate).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                              {payment.status || 'unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-1 justify-end">
                              <button
                                onClick={() => {
                                  const student = findStudentForPayment(payment);
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
                              {isAdmin() && (
                                <>
                                  <button
                                    onClick={() => handleEditPayment(payment)}
                                    className="text-indigo-600 hover:text-indigo-900 p-1"
                                    title="Edit Payment"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  {payment.status !== 'paid' && (
                                    <button
                                      onClick={() => handleMarkAsPaid(payment.id)}
                                      className="text-green-600 hover:text-green-900 p-1"
                                      title="Mark as Paid"
                                    >
                                      <IndianRupee className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeletePayment(payment)}
                                    className="text-red-600 hover:text-red-900 p-1"
                                    title="Delete Payment"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination (admin only) */}
                {isAdmin() && pagination.totalPages > 1 && (
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
        )}
      </div>

      {historyStudent && (
        <PaymentHistoryModal student={historyStudent} onClose={() => setHistoryStudent(null)} />
      )}
    </div>
  );
}

export default Payments;
