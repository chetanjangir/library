import React, { useEffect, useState } from 'react';
import { AlertCircle, Search, User } from 'lucide-react';
import Button from '../components/ui/Button';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { apiService } from '../services/api';
import { computeDueInfo, makePaymentRecord } from '../utils/dues';
import type { Student } from '../types';

function Dues() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [payInputs, setPayInputs] = useState<{ [key: string]: string }>({});
  const { toasts, removeToast, showSuccess, showError } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getStudents();
      setStudents(data);
    } catch (err) {
      setError('Failed to load students. Please check your database connection.');
      console.error('Error loading students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols = { USD: '$', EUR: '€', INR: '₹', GBP: '£' };
    return symbols[currency as keyof typeof symbols] || currency;
  };

  const dueStudents = students
    .filter(s => s.status !== 'inactive')
    .map(student => ({ student, info: computeDueInfo(student) }))
    .filter(({ info }) => info.due > 0)
    .filter(({ student }) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mobile.includes(searchTerm)
    )
    .sort((a, b) => b.info.due - a.info.due);

  const totalDue = dueStudents.reduce((sum, { info }) => sum + info.due, 0);

  const handleRecordPayment = async (student: Student) => {
    const amount = parseFloat(payInputs[student.id] || '0');
    if (!amount || amount <= 0) return;

    try {
      const updatedHistory = [
        ...(student.paymentHistory || []),
        makePaymentRecord(amount, 'payment', 'Dues payment')
      ];
      const info = computeDueInfo({ ...student, paymentHistory: updatedHistory });

      const updateData = {
        ...student,
        paymentHistory: updatedHistory,
        paidAmount: info.totalPaid,
        balanceAmount: info.due,
        paymentStatus: (info.due <= 0 ? 'paid' : 'partial') as 'paid' | 'due' | 'partial'
      };

      await apiService.updateStudent(student.id, updateData);
      await loadStudents();
      setPayInputs(prev => ({ ...prev, [student.id]: '' }));

      showSuccess(
        'Payment Recorded',
        info.due > 0
          ? `${getCurrencySymbol(student.currency)}${amount} recorded. Remaining due: ${getCurrencySymbol(student.currency)}${info.due.toFixed(2)}`
          : `${student.name} is now fully paid up!`
      );
    } catch (err) {
      showError('Update Failed', 'Failed to record payment');
      console.error('Error recording payment:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dues...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
            <AlertCircle className="w-6 h-6 mr-2 text-red-500" />
            Payment Dues
          </h1>
          <p className="text-gray-600 mt-1">Students with outstanding balances, calculated month-wise from their join date.</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm px-6 py-3 text-right">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Outstanding</p>
          <p className="text-2xl font-semibold text-red-600">₹{totalDue.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by name or mobile..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
        {dueStudents.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Outstanding Dues</h3>
            <p className="text-gray-500">Every student is paid up. Nice work!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Seat</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Months</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Expected</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Paid</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record Payment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dueStudents.map(({ student, info }) => (
                  <tr key={student.id}>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                          {student.photo ? (
                            <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.mobile}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                      {student.seatNumber ? `Seat ${student.seatNumber}` : '-'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.planType === 'monthly' ? `${info.monthsElapsed} mo` : '-'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                      {getCurrencySymbol(student.currency)}{info.expectedTotal.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                      {getCurrencySymbol(student.currency)}{info.totalPaid.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      {getCurrencySymbol(student.currency)}{info.due.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Amount"
                          className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          value={payInputs[student.id] || ''}
                          onChange={(e) => setPayInputs(prev => ({ ...prev, [student.id]: e.target.value }))}
                        />
                        <Button
                          variant="secondary"
                          onClick={() => handleRecordPayment(student)}
                          disabled={!payInputs[student.id] || parseFloat(payInputs[student.id]) <= 0}
                        >
                          Add
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dues;
