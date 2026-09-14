import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { Student } from '../../types';

interface RevenueChartProps {
  students: Student[];
  onRefresh?: () => void;
}

/**
 * Monthly revenue, computed straight from each student's payment ledger
 * (the same ledger the Students form / Dues page write to) rather than the
 * old disconnected payments collection - so this always matches reality.
 */
function RevenueChart({ students, onRefresh }: RevenueChartProps) {
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    let monthRevenue = 0;
    students.forEach(student => {
      (student.paymentHistory || []).forEach(entry => {
        const entryDate = new Date(entry.date);
        if (entryDate >= date && entryDate < nextMonth) {
          monthRevenue += entry.amount || 0;
        }
      });
    });

    months.push({
      name: date.toLocaleDateString('en-US', { month: 'short' }),
      value: Math.round(monthRevenue)
    });
  }

  const totalRevenue = months.reduce((sum, m) => sum + m.value, 0);
  const currentMonthRevenue = months[months.length - 1]?.value || 0;
  const previousMonthRevenue = months[months.length - 2]?.value || 0;
  const changePct = previousMonthRevenue > 0
    ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
    : (currentMonthRevenue > 0 ? 100 : 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Revenue Trends</h2>
          <p className="text-sm text-gray-500">Track your collections over time</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-semibold text-gray-900">₹{currentMonthRevenue.toLocaleString()}</span>
        <span className={`flex items-center text-sm font-medium ${changePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
          {changePct >= 0 ? '+' : ''}{changePct}%
        </span>
      </div>

      <div className="h-56 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={months} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              width={48}
            />
            <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} />
            <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2.5} fill="url(#revenueFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 mt-2 border-t border-gray-100 text-center">
        <div>
          <p className="text-xs text-gray-500">This Month</p>
          <p className="text-base font-semibold text-gray-900">₹{currentMonthRevenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total (6M)</p>
          <p className="text-base font-semibold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export default RevenueChart;
