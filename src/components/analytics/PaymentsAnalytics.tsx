import React from 'react';
import { DollarSign, TrendingUp, Calendar, AlertCircle, CreditCard, Clock } from 'lucide-react';
import type { Payment, Student } from '../../types';

interface PaymentsAnalyticsProps {
  payments: Payment[];
  students: Student[];
}

function PaymentsAnalytics({ payments, students }: PaymentsAnalyticsProps) {
  // Calculate payment statistics
  const totalCollected = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalDues = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const overdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
  
  // Upcoming payments (next 30 days)
  const now = new Date();
  const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingPayments = payments.filter(p => {
    const dueDate = new Date(p.dueDate);
    return dueDate >= now && dueDate <= next30Days && p.status === 'pending';
  });

  // Monthly payment trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthPayments = payments.filter(p => {
      const paymentDate = new Date(p.paidDate || p.dueDate);
      return paymentDate.getMonth() === date.getMonth() && 
             paymentDate.getFullYear() === date.getFullYear() &&
             p.status === 'paid';
    });
    
    monthlyTrend.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      amount: monthPayments.reduce((sum, p) => sum + p.amount, 0)
    });
  }

  const maxTrendAmount = Math.max(...monthlyTrend.map(m => m.amount));

  // Payment methods (simulated data)
  const paymentMethods = [
    { method: 'Cash', amount: totalCollected * 0.6, percentage: 60 },
    { method: 'Bank Transfer', amount: totalCollected * 0.25, percentage: 25 },
    { method: 'UPI/Digital', amount: totalCollected * 0.15, percentage: 15 },
  ];

  return (
    <div className="space-y-6">
      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Total Collected</p>
              <p className="text-2xl font-bold text-green-900">${totalCollected.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Total Dues</p>
              <p className="text-2xl font-bold text-yellow-900">${totalDues.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Upcoming (30 days)</p>
              <p className="text-2xl font-bold text-blue-900">{upcomingPayments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Overdue</p>
              <p className="text-2xl font-bold text-red-900">${overdue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Payment Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Payment Trend</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          
          <div className="flex items-end space-x-2 h-48">
            {monthlyTrend.map((month, index) => {
              const height = maxTrendAmount > 0 ? (month.amount / maxTrendAmount) * 160 : 0;
              
              return (
                <div key={month.month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-indigo-600 rounded-t transition-all duration-300 hover:bg-indigo-700"
                    style={{ height: `${height}px` }}
                    title={`${month.month}: $${month.amount.toLocaleString()}`}
                  />
                  <span className="mt-2 text-xs text-gray-600 font-medium">{month.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
            <CreditCard className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded mr-3 ${
                    index === 0 ? 'bg-green-500' : 
                    index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-900">{method.method}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${method.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{method.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Payments Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Payments (Next 30 Days)</h3>
        </div>
        
        {upcomingPayments.length === 0 ? (
          <div className="p-6 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming payments in the next 30 days</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingPayments.slice(0, 10).map((payment) => {
                  const daysLeft = Math.ceil((new Date(payment.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.studentName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${payment.amount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(payment.dueDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          daysLeft <= 3 ? 'bg-red-100 text-red-800' :
                          daysLeft <= 7 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {daysLeft} days
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentsAnalytics;