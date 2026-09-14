import React, { useEffect, useRef, useState } from 'react';
import { Plus, MessageCircle, AlertTriangle, Search, Calendar, X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import StudentForm from '../components/students/StudentForm';
import StudentList from '../components/students/StudentList';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { apiService } from '../services/api';
import { computeDueInfo, makePaymentRecord } from '../utils/dues';
import type { Student } from '../types';

const PAGE_SIZE = 20;

function escapeCsvValue(value: unknown): string {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [prefilledSeatNumber, setPrefilledSeatNumber] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [seatFilter, setSeatFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'due' | 'partial'>('all');
  const [expiryFilter, setExpiryFilter] = useState<number | null>(null);
  const [addedFilter, setAddedFilter] = useState<'all' | 'week' | 'month'>('all');
  const [showExpiryInput, setShowExpiryInput] = useState(false);
  const [customExpiryDays, setCustomExpiryDays] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const filterKey = JSON.stringify({ debouncedSearch, statusFilter, seatFilter, paymentFilter, expiryFilter, addedFilter });
  const prevFilterKey = useRef(filterKey);

  // Load the current page whenever the page number or any filter changes.
  // When a filter changes we first snap back to page 1 (without an extra
  // fetch) and let the page-change re-run this effect to do the actual fetch.
  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }
    loadStudentsPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterKey]);

  // Check for seat number from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const seatParam = urlParams.get('seat');
    if (seatParam) {
      const seatNumber = parseInt(seatParam);
      if (seatNumber >= 1 && seatNumber <= 100) {
        setPrefilledSeatNumber(seatNumber);
        setShowForm(true);
        // Clear the URL parameter
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const loadStudentsPage = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getStudentsPaged({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        status: statusFilter,
        seatFilter,
        paymentStatus: paymentFilter,
        expiryDays: expiryFilter,
        addedWithin: addedFilter
      });
      setStudents(result.students);
      setPagination(result.pagination);
      setExpiringSoonCount(result.expiringSoonCount || 0);
    } catch (err) {
      setError('Failed to load students. Please check your database connection.');
      console.error('Error loading students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      // Add prefilled seat number if available
      const finalStudentData = {
        ...studentData,
        seatNumber: prefilledSeatNumber || studentData.seatNumber
      };
      
      if (editingStudent) {
        await apiService.updateStudent(editingStudent.id, finalStudentData);
      } else {
        await apiService.createStudent(finalStudentData);
        
        // Send welcome message if auto-welcome is enabled
        if (finalStudentData.mobile) {
          try {
            const response = await fetch('/api/whatsapp', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                type: 'welcome',
                mobile: finalStudentData.mobile,
                studentName: finalStudentData.name,
                seatNumber: finalStudentData.seatNumber,
                wifiSSID: undefined, // Will use default from settings
                wifiPassword: undefined // Will use default from settings
              })
            });

            if (response.ok) {
              const result = await response.json();
              console.log('Welcome message sent:', result.success);
            }
          } catch (error) {
            console.error('Failed to send welcome message:', error);
          }
        }
      }
      
      setShowForm(false);
      setEditingStudent(null);
      setPrefilledSeatNumber(undefined);

      // Newly added students sort to the top (most recent first) - jump back
      // to page 1 so the admin sees it; otherwise just refresh the current page.
      if (!editingStudent && page !== 1) {
        setPage(1);
      } else {
        await loadStudentsPage();
      }
      
      showSuccess(
        `Student ${editingStudent ? 'Updated' : 'Added'}`,
        `${finalStudentData.name} ${editingStudent ? 'updated' : 'added'} successfully!${finalStudentData.mobile ? ' WhatsApp welcome message sent.' : ''}`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${editingStudent ? 'update' : 'add'} student`;
      setError(errorMessage);
      showError('Operation Failed', errorMessage);
      console.error('Error saving student:', err);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setPrefilledSeatNumber(undefined);
    setShowForm(true);
  };

  const handleDeleteStudent = async (student: Student) => {
    if (confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
      try {
        await apiService.deleteStudent(student.id);
        await loadStudentsPage();
        showSuccess('Student Deleted', `${student.name} deleted successfully!`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete student';
        setError(errorMessage);
        showError('Delete Failed', errorMessage);
        console.error('Error deleting student:', err);
      }
    }
  };

  const handleUpdateBalance = async (student: Student, amount: number) => {
    try {
      const updatedHistory = [
        ...(student.paymentHistory || []),
        makePaymentRecord(amount, 'payment', 'Balance payment')
      ];
      const info = computeDueInfo({ ...student, paymentHistory: updatedHistory });

      const updateData = {
        ...student,
        paymentHistory: updatedHistory,
        paidAmount: info.totalPaid,
        balanceAmount: info.due,
        paymentStatus: (info.due <= 0 ? 'paid' : info.totalPaid > 0 ? 'partial' : 'due') as 'paid' | 'due' | 'partial'
      };

      await apiService.updateStudent(student.id, updateData);
      await loadStudentsPage();
      showSuccess(
        'Payment Added',
        `₹${amount} added to ${student.name}'s account. Remaining due: ₹${info.due.toFixed(2)}`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update balance';
      setError(errorMessage);
      showError('Update Failed', errorMessage);
      console.error('Error updating balance:', err);
    }
  };

  const handleUpdateStatus = async (student: Student, newStatus: 'active' | 'inactive' | 'expired'): Promise<void> => {
    try {
      const updateData = {
        ...student,
        status: newStatus
      };

      await apiService.updateStudent(student.id, updateData);
      await loadStudentsPage();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleUpdatePaymentStatus = async (student: Student, newPaymentStatus: 'paid' | 'due' | 'partial'): Promise<void> => {
    try {
      const info = computeDueInfo(student);
      let updatedHistory = student.paymentHistory || [];

      // Marking as "paid" tops up the ledger to clear the outstanding due.
      // "due"/"partial" are informational only here - use "Add Balance" or the
      // edit form to record actual payments against the ledger.
      if (newPaymentStatus === 'paid' && info.due > 0) {
        updatedHistory = [...updatedHistory, makePaymentRecord(info.due, 'payment', 'Marked as fully paid')];
      }

      const newInfo = computeDueInfo({ ...student, paymentHistory: updatedHistory });

      const updateData = {
        ...student,
        paymentHistory: updatedHistory,
        paymentStatus: newPaymentStatus,
        paidAmount: newInfo.totalPaid,
        balanceAmount: newInfo.due
      };

      await apiService.updateStudent(student.id, updateData);
      
      // Also update any related payments
      try {
        console.log('Updating related payments for student:', student.id);
        const payments = await apiService.getPayments();
        const studentPayments = payments.filter(p => p.studentId === student.id);
        
        console.log('Found student payments:', studentPayments.length);
        
        for (const payment of studentPayments) {
          let paymentStatus = 'pending';
          let paidDate = null;
          
          if (newPaymentStatus === 'paid') {
            paymentStatus = 'paid';
            paidDate = new Date().toISOString().split('T')[0];
          } else if (newPaymentStatus === 'partial') {
            paymentStatus = 'pending';
          } else {
            paymentStatus = 'pending';
          }
          
          const paymentUpdateData = {
            ...payment,
            status: paymentStatus,
            paidDate: paidDate
          };
          console.log('Updating payment:', payment.id, paymentUpdateData);
          await apiService.updatePayment(payment.id, paymentUpdateData);
        }
      } catch (paymentError) {
        console.error('Error updating related payments:', paymentError);
      }
      
      await loadStudentsPage();
      
      // Show success notification
      showSuccess('Payment Status Updated', `${student.name} payment status changed to ${newPaymentStatus}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment status';
      setError(errorMessage);
      showError('Update Failed', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleSendReminder = async (student: Student) => {
    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'reminder',
          mobile: student.mobile,
          studentName: student.name,
          amount: student.dayType === 'half' ? student.halfDayAmount : student.fullDayAmount,
          currency: student.currency,
          dueDate: new Date(student.subscriptionEndDate).toLocaleDateString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showSuccess('Reminder Sent', `Payment reminder sent to ${student.name}`);
        } else {
          showError('Reminder Failed', result.error || 'Failed to send reminder');
        }
      } else {
        showError('Reminder Failed', 'Failed to send reminder');
      }
    } catch (err) {
      showError('Reminder Failed', 'Failed to send reminder');
      console.error('Error sending reminder:', err);
    }
  };

  const handleNotifyAllExpiring = async () => {
    try {
      const result = await apiService.getStudentsPaged({ page: 1, limit: 500, expiryDays: 7 });
      for (const student of result.students) {
        await handleSendReminder(student);
      }
    } catch (err) {
      showError('Notify Failed', 'Failed to send expiry reminders');
      console.error('Error notifying expiring students:', err);
    }
  };

  const handleApplyExpiryFilter = () => {
    const days = parseInt(customExpiryDays);
    if (days > 0) {
      setExpiryFilter(days);
      setShowExpiryInput(false);
      setCustomExpiryDays('');
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSeatFilter('all');
    setPaymentFilter('all');
    setExpiryFilter(null);
    setCustomExpiryDays('');
    setShowExpiryInput(false);
    setAddedFilter('all');
  };

  const activeFiltersCount = [
    searchTerm,
    statusFilter !== 'all' ? statusFilter : null,
    seatFilter !== 'all' ? seatFilter : null,
    paymentFilter !== 'all' ? paymentFilter : null,
    expiryFilter !== null ? `${expiryFilter}d` : null,
    addedFilter !== 'all' ? addedFilter : null
  ].filter(Boolean).length;

  const handleDownloadStudents = async () => {
    setDownloading(true);
    try {
      // Fetch every student matching the current filters (not just the
      // current page) so the export is complete.
      const result = await apiService.getStudentsPaged({
        page: 1,
        limit: 100000,
        search: debouncedSearch,
        status: statusFilter,
        seatFilter,
        paymentStatus: paymentFilter,
        expiryDays: expiryFilter,
        addedWithin: addedFilter
      });
      const allFiltered = result.students;

      const headers = [
        'Name', "Father's Name", 'Mobile', 'Email', 'Aadhaar Number', 'Address',
        'Seat', 'Plan Type', 'Day Type', 'Half Day Slot', 'Start Date', 'Subscription End Date',
        'Currency', 'Cycle Amount', 'Total Paid', 'Balance Due', 'Advance/Credit',
        'Payment Status', 'Status'
      ];

      const rows = allFiltered.map(student => {
        const info = computeDueInfo(student);
        return [
          student.name,
          student.fatherName || '',
          student.mobile,
          student.email,
          student.aadhaarNumber || '',
          student.address || '',
          student.seatNumber ?? '',
          student.planType,
          student.dayType,
          student.halfDaySlot || '',
          student.startDate ? new Date(student.startDate).toLocaleDateString() : '',
          student.subscriptionEndDate ? new Date(student.subscriptionEndDate).toLocaleDateString() : '',
          student.currency,
          info.cycleAmount.toFixed(2),
          info.totalPaid.toFixed(2),
          info.due.toFixed(2),
          info.advance.toFixed(2),
          student.paymentStatus || 'due',
          student.status
        ];
      });

      const csvContent = [headers, ...rows]
        .map(row => row.map(escapeCsvValue).join(','))
        .join('\r\n');

      const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess('Download Started', `Exported ${allFiltered.length} student${allFiltered.length !== 1 ? 's' : ''} to CSV`);
    } catch (err) {
      showError('Download Failed', 'Failed to export students');
      console.error('Error downloading students:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading students...</div>
      </div>
    );
  }

  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const rangeEnd = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage student registrations and subscriptions</p>
          {expiringSoonCount > 0 && (
            <div className="mt-2 flex items-center text-yellow-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm">{expiringSoonCount} students expiring within 7 days</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
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
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, mobile, email, or seat number..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filter Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {/* Status Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              
              {/* Seat Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={seatFilter}
                  onChange={(e) => setSeatFilter(e.target.value as typeof seatFilter)}
                >
                  <option value="all">All Seats</option>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>

              {/* Recently Added Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Added</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={addedFilter}
                  onChange={(e) => setAddedFilter(e.target.value as typeof addedFilter)}
                >
                  <option value="all">Any Time</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              
              {/* Payment Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as typeof paymentFilter)}
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="due">Due</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
              
              {/* Expiry Filter */}
              <div className="space-y-1 relative">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</label>
                <button
                  onClick={() => setShowExpiryInput(!showExpiryInput)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm flex items-center justify-between ${
                    expiryFilter !== null ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'text-gray-700'
                  }`}
                >
                  <span>{expiryFilter !== null ? `${expiryFilter} days` : 'Select'}</span>
                  <Calendar className="w-4 h-4" />
                </button>
                
                {showExpiryInput && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-20 min-w-48">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">Days until expiry</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Days"
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          value={customExpiryDays}
                          onChange={(e) => setCustomExpiryDays(e.target.value)}
                        />
                        <button
                          onClick={handleApplyExpiryFilter}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => {
                            setExpiryFilter(null);
                            setShowExpiryInput(false);
                            setCustomExpiryDays('');
                          }}
                          className="px-2 py-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">Show students expiring in specified days</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Quick Filters */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quick</label>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setStatusFilter('active');
                      setPaymentFilter('due');
                    }}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Due
                  </button>
                  <button
                    onClick={() => {
                      setSeatFilter('unassigned');
                    }}
                    className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                  >
                    No Seat
                  </button>
                </div>
              </div>
              
              {/* Active Filters Summary */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</label>
                <div className="flex items-center justify-center h-8">
                  {activeFiltersCount > 0 ? (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                      {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          {expiringSoonCount > 0 && (
            <Button variant="secondary" onClick={handleNotifyAllExpiring}>
              <MessageCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Notify Expiring ({expiringSoonCount})</span>
              <span className="sm:hidden">Notify ({expiringSoonCount})</span>
            </Button>
          )}
          <Button variant="secondary" onClick={handleDownloadStudents} disabled={downloading || pagination.total === 0}>
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{downloading ? 'Preparing...' : `Download (${pagination.total})`}</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Add Student</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {showForm ? (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
              {prefilledSeatNumber && (
                <span className="text-sm text-gray-600 ml-2">
                  (Seat {prefilledSeatNumber} selected)
                </span>
              )}
            </h2>
            <StudentForm
              onSubmit={handleAddStudent}
              onCancel={() => {
                setShowForm(false);
                setEditingStudent(null);
                setPrefilledSeatNumber(undefined);
              }}
              editingStudent={editingStudent}
              prefilledSeatNumber={prefilledSeatNumber}
            />
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {pagination.total === 0
                    ? 'No students found'
                    : `Showing ${rangeStart}-${rangeEnd} of ${pagination.total} students`}
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                      {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                    </span>
                  )}
                  {loading && <span className="ml-2 text-xs text-gray-400">Loading...</span>}
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
            <StudentList 
              students={students}
              onEdit={handleEditStudent}
              onSendReminder={handleSendReminder}
              onDelete={handleDeleteStudent}
              onUpdateBalance={handleUpdateBalance}
              onUpdateStatus={handleUpdateStatus}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
              startIndex={(pagination.page - 1) * pagination.limit}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
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
          </div>
        )}
      </div>
    </div>
  );
}

export default Students;
