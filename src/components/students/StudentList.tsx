import React from 'react';
import { Edit, MessageCircle, AlertTriangle, Trash2, User } from 'lucide-react';
import type { Student } from '../../types';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import { computeDueInfo } from '../../utils/dues';

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onSendReminder: (student: Student) => void;
  onDelete: (student: Student) => void;
  onUpdateBalance: (student: Student, amount: number) => void;
  onUpdateStatus: (student: Student, status: 'active' | 'inactive' | 'expired') => Promise<void>;
  onUpdatePaymentStatus: (student: Student, status: 'paid' | 'due' | 'partial') => Promise<void>;
  startIndex?: number;
}

function StudentList({ students, onEdit, onSendReminder, onDelete, onUpdateBalance, onUpdateStatus, onUpdatePaymentStatus, startIndex = 0 }: StudentListProps) {
  const [balanceInputs, setBalanceInputs] = React.useState<{[key: string]: string}>({});
  const [photoPreview, setPhotoPreview] = React.useState<{ src: string; name: string; top: number; left: number } | null>(null);
  const { showSuccess, showError } = useToast();

  const showPhotoPreview = (e: React.MouseEvent<HTMLElement>, src: string | undefined, name: string) => {
    if (!src) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const previewSize = 260;
    const left = Math.min(rect.right + 16, window.innerWidth - previewSize - 16);
    const top = Math.min(Math.max(rect.top - previewSize / 2 + rect.height / 2, 16), window.innerHeight - previewSize - 16);
    setPhotoPreview({ src, name, top, left });
  };

  const hidePhotoPreview = () => setPhotoPreview(null);

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

  // Sort students with the most recently added first. Falls back to comparing
  // Mongo ObjectIds (which are chronologically sortable as strings) for any
  // legacy records that don't have a createdAt timestamp.
  const sortedStudents = [...students].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : NaN;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : NaN;
    if (!isNaN(aTime) && !isNaN(bTime)) return bTime - aTime;
    if (!isNaN(aTime)) return -1;
    if (!isNaN(bTime)) return 1;
    return String(b.id).localeCompare(String(a.id));
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
    onUpdateStatus(student, newStatus as 'active' | 'inactive' | 'expired')
      .then(() => {
        showSuccess('Status Updated', `${student.name} status changed to ${newStatus}`);
      })
      .catch(() => {
        showError('Update Failed', 'Failed to update student status');
      });
  };

  const handlePaymentStatusUpdate = (student: Student, newStatus: string) => {
    onUpdatePaymentStatus(student, newStatus as 'paid' | 'due' | 'partial')
      .then(() => {
        showSuccess('Payment Status Updated', `${student.name} payment status changed to ${newStatus}`);
      })
      .catch(() => {
        showError('Update Failed', 'Failed to update payment status');
      });
  };

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Seat / Plan</th>
            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment & Dues</th>
            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record Payment</th>
            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Expiry / Status</th>
            <th className="px-2 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedStudents.map((student, index) => (
            <tr key={student.id} className={
              isExpired(student.subscriptionEndDate) ? 'bg-red-50' : 
              isExpiringSoon(student.subscriptionEndDate) ? 'bg-yellow-50' : 
              !student.seatNumber ? 'bg-orange-50 border-l-4 border-orange-400' : ''
            }>
              <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {startIndex + index + 1}
              </td>

              {/* Student: photo, name, contact, plan/seat (shown here on small screens) */}
              <td className="px-2 sm:px-4 py-4">
                <div className="flex items-start space-x-3">
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0"
                    onMouseEnter={(e) => showPhotoPreview(e, student.photo, student.name)}
                    onMouseLeave={hidePhotoPreview}
                  >
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.name}
                        className="w-full h-full object-cover cursor-pointer"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[9rem] sm:max-w-none">{student.name}</div>
                    {student.fatherName && (
                      <div className="text-xs text-gray-500 truncate">Father: {student.fatherName}</div>
                    )}
                    <div className="text-xs text-gray-500 truncate">{student.mobile}</div>
                    <div className="text-xs text-gray-500 truncate hidden sm:block">{student.email}</div>
                    {student.biometricId && (
                      <div className="text-xs text-gray-500 truncate">Bio ID: {student.biometricId}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-0.5">
                      Start: {new Date(student.startDate || student.joinDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-900 lg:hidden mt-0.5">
                      {student.seatNumber ? `Seat ${student.seatNumber}` : 'No seat'} · <span className="capitalize">{student.planType}</span> <span className="capitalize">({student.dayType})</span>
                    </div>
                  </div>
                </div>
              </td>

              {/* Seat / Plan (desktop only - shown inline on mobile above) */}
              <td className="px-2 sm:px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                <div className="text-sm text-gray-900">
                  {student.seatNumber ? `Seat ${student.seatNumber}` : 'Not assigned'}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {student.planType} · {student.dayType} day{student.dayType === 'half' && student.halfDaySlot ? ` (${student.halfDaySlot})` : ''}
                </div>
                <div className="text-xs text-gray-400">
                  Since {new Date(student.startDate || student.joinDate).toLocaleDateString()}
                </div>
              </td>

              {/* Payment & Dues: cycle amount, status badge, paid/due/advance */}
              <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {getCurrencySymbol(student.currency)}{student.dayType === 'half' ? student.halfDayAmount : student.fullDayAmount}
                  <span className="text-xs text-gray-400">/cycle</span>
                </div>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${getPaymentStatusColor(student.paymentStatus || 'due')}`}>
                  {student.paymentStatus || 'due'}
                </span>
                {computeDueInfo(student).due > 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    Due: {getCurrencySymbol(student.currency)}{computeDueInfo(student).due.toFixed(2)}
                    {student.planType === 'monthly' && ` (${computeDueInfo(student).monthsElapsed}mo)`}
                  </div>
                )}
                {computeDueInfo(student).advance > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    Advance: {getCurrencySymbol(student.currency)}{computeDueInfo(student).advance.toFixed(2)}
                  </div>
                )}
              </td>

              {/* Record Payment: add-balance input + quick status select, together */}
              <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    className="w-16 sm:w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={balanceInputs[student.id] || ''}
                    onChange={(e) => setBalanceInputs(prev => ({ ...prev, [student.id]: e.target.value }))}
                  />
                  <button
                    onClick={() => handleBalanceUpdate(student)}
                    className="p-1 text-green-600 hover:text-green-800"
                    title="Add Payment"
                    disabled={!balanceInputs[student.id] || parseFloat(balanceInputs[student.id]) <= 0}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                <select
                  value={student.paymentStatus || 'due'}
                  onChange={(e) => handlePaymentStatusUpdate(student, e.target.value)}
                  className={`mt-1 px-2 py-1 text-xs font-semibold rounded border-0 cursor-pointer ${
                    student.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    student.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="due">Due</option>
                </select>
              </td>

              {/* Expiry / Status (desktop only) */}
              <td className="px-2 sm:px-4 py-4 whitespace-nowrap hidden md:table-cell">
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
                <select
                  className={`mt-1 px-2 py-1 text-xs font-semibold rounded border-0 ${
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
              </td>

              <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
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

      {photoPreview && (
        <div
          className="fixed z-50 pointer-events-none bg-white p-1.5 rounded-lg shadow-2xl border border-gray-200"
          style={{ top: photoPreview.top, left: photoPreview.left }}
        >
          <img
            src={photoPreview.src}
            alt={photoPreview.name}
            className="w-56 h-56 object-cover rounded-md"
          />
          <p className="text-xs text-center text-gray-600 mt-1 font-medium truncate max-w-[14rem]">{photoPreview.name}</p>
        </div>
      )}
    </div>
  );
}

export default StudentList;
