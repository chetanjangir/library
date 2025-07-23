import React from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';
import type { Student, Payment } from '../../types';

interface RevenueChartProps {
  students: Student[];
  payments?: Payment[];
  onRefresh?: () => void;
}

function RevenueChart({ students, payments = [], onRefresh }: RevenueChartProps) {
  // Generate last 6 months data
  const months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push({
      name: date.toLocaleDateString('en-US', { month: 'short' }),
      value: 0
    });
  }

  // Calculate actual revenue from payments for each month
  months.forEach((month, index) => {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1);
    const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
    
    // Get payments for this month
    const monthPayments = payments.filter(payment => {
      if (!payment.paidDate) return false;
      const paidDate = new Date(payment.paidDate);
      return paidDate >= monthDate && paidDate < nextMonth && payment.status === 'paid';
    });
    
    month.value = monthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  });

  const maxValue = Math.max(...months.map(m => m.value));
  const totalRevenue = months.reduce((sum, month) => sum + month.value, 0);
  const avgRevenue = Math.round(totalRevenue / months.length);

  const getCurrencySymbol = (currency: string) => {
    return '₹'; // Always INR as requested
  };
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Revenue Trends</h2>
          <p className="text-sm text-gray-600">Monthly revenue over the last 6 months</p>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end space-x-2 h-48 mb-4">
        {months.map((month, index) => {
          const height = maxValue > 0 ? (month.value / maxValue) * 160 : 0;
          const isCurrentMonth = index === months.length - 1;
          
          return (
            <div key={month.name} className="flex flex-col items-center flex-1">
              <div 
                className={`w-full rounded-t transition-all duration-300 hover:opacity-80 ${
                  isCurrentMonth ? 'bg-indigo-600' : 'bg-indigo-400'
                }`}
                style={{ height: `${height}px` }}
                title={`${month.name}: ₹${month.value.toLocaleString()}`}
              />
              <span className="mt-2 text-xs text-gray-600 font-medium">{month.name}</span>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
          </div>
          <p className="text-sm text-gray-600">Current Month</p>
          <p className="text-lg font-semibold text-gray-900">
            ₹{months[months.length - 1]?.value.toLocaleString() || '0'}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          </div>
          <p className="text-sm text-gray-600">Average</p>
          <p className="text-lg font-semibold text-gray-900">₹{avgRevenue.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className="w-4 h-4 text-blue-500 mr-1" />
          </div>
          <p className="text-sm text-gray-600">Total (6M)</p>
          <p className="text-lg font-semibold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export default RevenueChart;