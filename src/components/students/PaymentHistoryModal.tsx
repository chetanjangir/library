import React from 'react';
import { X } from 'lucide-react';
import type { Student } from '../../types';
import { computeDueInfo, getUpcomingDues } from '../../utils/dues';

interface PaymentHistoryModalProps {
  student: Student;
  onClose: () => void;
}

function PaymentHistoryModal({ student, onClose }: PaymentHistoryModalProps) {
  const getCurrencySymbol = (currency: string) => {
    const symbols = { USD: '$', EUR: '€', INR: '₹', GBP: '£' };
    return symbols[currency as keyof typeof symbols] || currency;
  };

  const info = computeDueInfo(student);
  const history = [...(student.paymentHistory || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const upcoming = getUpcomingDues(student);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="text-base font-medium text-gray-900">Payment History</h3>
            <p className="text-sm text-gray-500">
              {student.name}
              {student.seatNumber ? ` · Seat ${student.seatNumber}` : ''}
              {student.customMonthlyAmount ? ' · Custom Plan' : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm bg-blue-50 border-b">
          <div>
            <span className="text-blue-600">Cycle Amount:</span>
            <p className="font-medium">{getCurrencySymbol(student.currency)}{info.cycleAmount.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-blue-600">Total Paid:</span>
            <p className="font-medium">{getCurrencySymbol(student.currency)}{info.totalPaid.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-blue-600">Balance Due:</span>
            <p className={`font-medium ${info.due > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {getCurrencySymbol(student.currency)}{info.due.toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-blue-600">Advance:</span>
            <p className={`font-medium ${info.advance > 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {getCurrencySymbol(student.currency)}{info.advance.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {upcoming.length > 0 && (
            <div>
              <p className="px-5 pt-3 pb-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Upcoming Dues</p>
              <div className="divide-y">
                {upcoming.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between px-5 py-3 text-sm bg-amber-50/50">
                    <div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium mr-2 bg-amber-100 text-amber-700">
                        {entry.label}
                      </span>
                      <span className="text-gray-500">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {getCurrencySymbol(student.currency)}{entry.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <p className="px-5 pt-3 pb-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Past Payments</p>
          )}
          {history.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No payments recorded yet.</p>
          ) : (
            <div className="divide-y">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium mr-2 ${
                        entry.type === 'advance' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {entry.type === 'advance' ? 'Advance' : 'Payment'}
                    </span>
                    <span className="text-gray-500">{new Date(entry.date).toLocaleDateString()}</span>
                    {entry.note && <span className="text-gray-400 text-xs block mt-0.5">{entry.note}</span>}
                  </div>
                  <span className="font-medium text-gray-900">
                    {getCurrencySymbol(student.currency)}{entry.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentHistoryModal;
