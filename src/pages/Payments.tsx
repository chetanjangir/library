import { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import Button from '../components/ui/Button';
import PaymentForm from '../components/payments/PaymentForm';
import type { Payment, Student } from '../types';

// Sample students data for payment form
const sampleStudents: Student[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    mobile: '+1234567890',
    joinDate: '2023-11-01',
    planType: 'monthly',
    dayType: 'full',
    status: 'active',
    seatNumber: 15,
    subscriptionEndDate: '2024-01-15',
    currency: 'USD',
    monthlyAmount: 100,
    halfDayAmount: 60,
    fullDayAmount: 100
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    mobile: '+1234567891',
    joinDate: '2023-11-05',
    planType: 'monthly',
    dayType: 'half',
    halfDaySlot: 'morning',
    status: 'active',
    seatNumber: 23,
    subscriptionEndDate: '2024-01-10',
    currency: 'USD',
    monthlyAmount: 100,
    halfDayAmount: 60,
    fullDayAmount: 100
  }
];

const samplePayments: Payment[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'John Doe',
    amount: 100,
    currency: 'USD',
    dueDate: '2023-12-15',
    status: 'pending',
    planType: 'monthly',
    dayType: 'full'
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Jane Smith',
    amount: 60,
    currency: 'USD',
    dueDate: '2023-12-01',
    paidDate: '2023-11-28',
    status: 'paid',
    planType: 'monthly',
    dayType: 'half'
  },
  {
    id: '3',
    studentId: '1',
    studentName: 'John Doe',
    amount: 100,
    currency: 'USD',
    dueDate: '2023-11-30',
    status: 'overdue',
    planType: 'monthly',
    dayType: 'full'
  }
];

function Payments() {
  const [payments, setPayments] = useState<Payment[]>(samplePayments);
  const [showForm, setShowForm] = useState(false);

  const handleAddPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: (payments.length + 1).toString()
    };
    setPayments([...payments, newPayment]);
    setShowForm(false);
  };

  const handleMarkAsPaid = (paymentId: string) => {
    setPayments(payments.map(payment => 
      payment.id === paymentId 
        ? { ...payment, status: 'paid', paidDate: new Date().toISOString() }
        : payment
    ));
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols = { USD: '$', EUR: '€', INR: '₹', GBP: '£' };
    return symbols[currency as keyof typeof symbols] || currency;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOverdue = payments
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Payment
        </Button>
      </div>

      {/* Payment Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-semibold text-gray-900">${totalPaid}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">${totalPending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">${totalOverdue}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {showForm ? (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Add New Payment</h2>
            <PaymentForm
              students={sampleStudents}
              onSubmit={handleAddPayment}
              onCancel={() => setShowForm(false)}
            />
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.studentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getCurrencySymbol(payment.currency)}{payment.amount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{payment.planType}</div>
                      <div className="text-xs text-gray-500 capitalize">{payment.dayType} day</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </div>
                      {payment.paidDate && (
                        <div className="text-xs text-gray-500">
                          Paid: {new Date(payment.paidDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payment.status !== 'paid' && (
                        <Button 
                          variant="secondary" 
                          onClick={() => handleMarkAsPaid(payment.id)}
                        >
                          Mark as Paid
                        </Button>
                      )}
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

export default Payments;