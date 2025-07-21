import React from 'react';
import { Edit, MessageCircle, AlertTriangle } from 'lucide-react';
import type { Student } from '../../types';
import Button from '../ui/Button';

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onSendReminder: (student: Student) => void;
}

function StudentList({ students, onEdit, onSendReminder }: StudentListProps) {
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

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Contact</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Plan</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Subscription</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student.id} className={isExpired(student.subscriptionEndDate) ? 'bg-red-50' : isExpiringSoon(student.subscriptionEndDate) ? 'bg-yellow-50' : ''}>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900 truncate max-w-32 sm:max-w-none">{student.name}</div>
                  <div className="text-sm text-gray-500 sm:hidden truncate max-w-32">{student.mobile}</div>
                  <div className="text-sm text-gray-500 hidden sm:block truncate">{student.email}</div>
                </div>
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                {student.mobile}
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
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  student.status === 'active' ? 'bg-green-100 text-green-800' :
                  student.status === 'expired' ? 'bg-red-100 text-red-800' :
                  student.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {student.status}
                </span>
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
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onSendReminder(student)}
                  className="text-green-600 hover:text-green-900 p-1"
                >
                  <MessageCircle className="w-4 h-4" />
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