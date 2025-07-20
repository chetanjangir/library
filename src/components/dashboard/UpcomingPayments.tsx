import { Calendar } from 'lucide-react';
import type { Payment } from '../../types';

const samplePayments: Payment[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Alice Johnson',
    amount: 500,
    dueDate: '2023-12-15',
    status: 'pending'
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Bob Smith',
    amount: 750,
    dueDate: '2023-12-18',
    status: 'pending'
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Carol Williams',
    amount: 1000,
    dueDate: '2023-12-20',
    status: 'pending'
  }
];

function UpcomingPayments() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Payments</h2>
        <Calendar className="w-5 h-5 text-gray-500" />
      </div>
      <div className="space-y-4">
        {samplePayments.map((payment) => (
          <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{payment.studentName}</p>
              <p className="text-sm text-gray-600">Due on {new Date(payment.dueDate).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">${payment.amount}</p>
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                {payment.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UpcomingPayments