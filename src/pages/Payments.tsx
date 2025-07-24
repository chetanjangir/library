import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Edit } from 'lucide-react';
import Button from '../components/ui/Button';
import PaymentForm from '../components/payments/PaymentForm';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Payment, Student } from '../types';

function Payments() {
  const { isAdmin, user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load students and payments
      const [studentsData, paymentsData] = await Promise.all([
        apiService.getStudents(),
        apiService.getPayments()
      ]);
      
      if (isAdmin()) {
        // Admin sees all data
        setStudents(studentsData);
        setPayments(paymentsData);
      } else {
        // Student sees only their own data
        const currentStudent = studentsData.find(s => s.id === user?.studentId);
        const studentPayments = paymentsData.filter(p => p.studentId === user?.studentId);
        
        setStudents(currentStudent ? [currentStudent] : []);
        setPayments(studentPayments);
      }
    } catch (err) {
      setError('Failed to load data. Please check your database connection.');
      console.error('Error loading data:', err);
      setStudents([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
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
      
      await loadData();
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
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      const updateData = {
        ...payment,
        status: 'paid',
        paidDate: new Date().toISOString()
      };

      await apiService.updatePayment(paymentId, updateData);
      
      await loadData();
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

  // Calculate payment statistics
  const totalPending = payments
    .filter(p => p && (p.status === 'pending' || p.status === 'due'))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalOverdue = payments
    .filter(p => p && (p.status === 'overdue' || p.status === 'expired'))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalPaid = payments
    .filter(p => p && p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading payments...</div>
      </div>
    );
  }

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
        {isAdmin() && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Payment
          </Button>
        )}
      </div>

      {/* Payment Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-semibold text-gray-900">₹{(totalPaid || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Due</p>
              <p className="text-2xl font-semibold text-gray-900">₹{(totalPending || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">₹{(totalOverdue || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

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
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isAdmin() ? 'No Payments Found' : 'No Payment History'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {isAdmin() 
                    ? 'Payments are automatically generated when students are added.'
                    : 'Your payment history will appear here once payments are processed.'
                  }
                </p>
                {isAdmin() && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Manual Payment
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      {isAdmin() && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      )}
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
                            ₹{(payment.amount || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{payment.planType}</div>
                            <button 
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this payment?')) {
                                  try {
                                    await apiService.deletePayment(payment.id);
                                    await loadData();
                                    showSuccess('Payment Deleted', 'Payment deleted successfully!');
                                  } catch (err) {
                                    showError('Delete Failed', 'Failed to delete payment');
                                    console.error('Error deleting payment:', err);
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete Payment"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
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
                        {isAdmin() && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2 justify-end">
                              <button 
                                onClick={() => handleEditPayment(payment)}
                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                title="Edit Payment"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {payment.status !== 'paid' && (
                                <Button 
                                  variant="secondary" 
                                  onClick={() => handleMarkAsPaid(payment.id)}
                                >
                                  Mark as Paid
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Payments;