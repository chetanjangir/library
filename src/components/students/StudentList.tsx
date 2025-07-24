import React from 'react';
import { Edit, MessageCircle, AlertTriangle, Trash2, DollarSign, UserCheck } from 'lucide-react';
import type { Student } from '../../types';
import Button from '../ui/Button';

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onSendReminder: (student: Student) => void;
  onDelete: (student: Student) => void;
  onUpdateBalance: (student: Student, amount: number) => void;
  onUpdateStatus: (student: Student, status: 'active' | 'inactive' | 'expired') => void;
  onTogglePaymentStatus: (student: Student) => void;
}

function StudentList({ students, onEdit, onSendReminder, onDelete, onUpdateBalance, onUpdateStatus, onTogglePaymentStatus }: StudentListProps) {
  const [balanceInputs, setBalanceInputs] = React.useState<{[key: string]: string}>({});
  const [statusUpdates, setStatusUpdates] = React.useState<{[key: string]: string}>({});

  const getCurrencySymbol = (currency: string) => {
    const symbols = { USD: '$', EUR: '€', INR: '₹', GBP: '£' };
    return symbols[currency as keyof typeof symbols] || currency;
  };

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const isExpired = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    return end < now;
  };

  // Sort students by seat number
  const sortedStudents = [...students].sort((a, b) => {
    if (!a.seatNumber && !b.seatNumber) return 0;
    if (!a.seatNumber) return 1;
    if (!b.seatNumber) return -1;
    return a.seatNumber - b.seatNumber;
  });

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'due': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBalanceUpdate = (student: Student) => {
    const amount = parseFloat(balanceInputs[student.id] || '0');
    if (amount > 0) {
      onUpdateBalance(student, amount);
      setBalanceInputs(prev => ({ ...prev, [student.id]: '' }));
    }
  };

  const handleStatusUpdate = (student: Student, newStatus: string) => {
    onUpdateStatus(student, newStatus as 'active' | 'inactive' | 'expired');
  };

  const handlePaymentStatusToggle = (student: Student) => {
    onTogglePaymentStatus(student);
  };

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Contact</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Start Date</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Plan</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Add Balance</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Status</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Subscription</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedStudents.map((student, index) => (
            <tr key={student.id} className={isExpired(student.subscriptionEndDate) ? 'bg-red-50' : isExpiringSoon(student.subscriptionEndDate) ? 'bg-yellow-50' : ''}>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {index + 1}
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900 truncate max-w-32 sm:max-w-none">{student.name}</div>
                  <div className="text-sm text-gray-500 sm:hidden truncate max-w-32">{student.mobile}</div>
                  <div className="text-sm text-gray-500 hidden sm:block truncate">{student.email}</div>
                  {student.biometricId && (
                    <div className="text-xs text-gray-500">Bio ID: {student.biometricId}</div>
                  )}
                </div>
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                {student.mobile}
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                <div className="text-sm text-gray-900">
                  {new Date(student.startDate || student.joinDate).toLocaleDateString()}
                </div>
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {student.seatNumber ? `Seat ${student.seatNumber}` : 'Not assigned'}
                </div>
                {student.dayType === 'half' && (
                  <div className="text-xs text-gray-500 capitalize hidden sm:block">
                    {student.halfDaySlot} slot
                  </div>
                )}
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                <div className="text-sm text-gray-900 capitalize">{student.planType}</div>
                <div className="text-xs text-gray-500 capitalize">{student.dayType} day</div>
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {getCurrencySymbol(student.currency)}{student.dayType === 'half' ? student.halfDayAmount : student.fullDayAmount}
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(student.paymentStatus || 'due')}`}>
                  {student.paymentStatus || 'due'}
                </span>
                {student.paymentStatus === 'partial' && (
                  <div className="text-xs text-gray-500 mt-1">
                    Paid: {getCurrencySymbol(student.currency)}{student.paidAmount || 0}
                  </div>
                )}
                {student.balanceAmount && student.balanceAmount > 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    Balance: {getCurrencySymbol(student.currency)}{student.balanceAmount}
                  </div>
                )}
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={balanceInputs[student.id] || ''}
                    onChange={(e) => setBalanceInputs(prev => ({ ...prev, [student.id]: e.target.value }))}
                  />
                  <button
                    onClick={() => handleBalanceUpdate(student)}
                    className="p-1 text-green-600 hover:text-green-800"
                    title="Add Balance"
                    disabled={!balanceInputs[student.id] || parseFloat(balanceInputs[student.id]) <= 0}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handlePaymentStatusToggle(student)}
                  className={`px-2 py-1 text-xs font-semibold rounded border-0 cursor-pointer hover:opacity-80 ${
                    student.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    student.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                  title="Click to toggle payment status"
                >
                  {student.paymentStatus === 'paid' ? 'Paid' :
                   student.paymentStatus === 'partial' ? 'Partial' : 'Due'}
                </button>
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                <div className="text-sm text-gray-900">
                  Expires: {new Date(student.subscriptionEndDate).toLocaleDateString()}
                </div>
                {isExpiringSoon(student.subscriptionEndDate) && (
                  <div className="flex items-center text-xs text-yellow-600">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Expiring soon
                  </div>
                )}
                {isExpired(student.subscriptionEndDate) && (
                  <div className="flex items-center text-xs text-red-600">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Expired
                  </div>
                )}
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <select
                  className={`px-2 py-1 text-xs font-semibold rounded border-0 ${
                    student.status === 'active' ? 'bg-green-100 text-green-800' :
                    student.status === 'expired' ? 'bg-red-100 text-red-800' :
                    student.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}
                  value={student.status}
                  onChange={(e) => handleStatusUpdate(student, e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
                {isExpired(student.subscriptionEndDate) && student.status !== 'expired' && (
                  <div className="text-xs text-red-600 mt-1">
                    Subscription expired
                  </div>
                )}
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex space-x-1 justify-end">
                <button 
                  onClick={() => onEdit(student)}
                  className="text-indigo-600 hover:text-indigo-900 p-1"
                  title="Edit Student"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onSendReminder(student)}
                  className="text-green-600 hover:text-green-900 p-1"
                  title="Send Reminder"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
                      onDelete(student);
                    }
                  }}
                  className="text-red-600 hover:text-red-900 p-1"
                  title="Delete Student"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentList;