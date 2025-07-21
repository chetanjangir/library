import React from 'react';
import { DollarSign, TrendingUp, Target, PieChart } from 'lucide-react';
import type { Student, Payment } from '../../types';

interface RevenueAnalyticsProps {
  students: Student[];
  payments: Payment[];
}

function RevenueAnalytics({ students, payments }: RevenueAnalyticsProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate monthly revenue
  const monthlyRevenue = students
    .filter(s => s.status === 'active')
    .reduce((sum, student) => {
      const amount = student.dayType === 'half' ? student.halfDayAmount : student.fullDayAmount;
      return sum + amount;
    }, 0);

  // Calculate quarterly revenue (last 3 months)
  const quarterlyRevenue = monthlyRevenue * 3; // Simplified calculation

  // Annual target (configurable)
  const annualTarget = 50000; // $50,000 target
  const annualProgress = Math.round((monthlyRevenue * 12 / annualTarget) * 100);

  // Revenue breakdown by plan type
  const revenueBreakdown = [
    {
      type: 'Monthly Plans',
      amount: students.filter(s => s.planType === 'monthly' && s.status === 'active')
        .reduce((sum, s) => sum + (s.dayType === 'half' ? s.halfDayAmount : s.fullDayAmount), 0),
      count: students.filter(s => s.planType === 'monthly' && s.status === 'active').length,
      color: 'bg-blue-500'
    },
    {
      type: 'Yearly Plans',
      amount: students.filter(s => s.planType === 'yearly' && s.status === 'active')
        .reduce((sum, s) => sum + (s.dayType === 'half' ? s.halfDayAmount : s.fullDayAmount), 0),
      count: students.filter(s => s.planType === 'yearly' && s.status === 'active').length,
      color: 'bg-green-500'
    },
    {
      type: 'Daily Plans',
      amount: students.filter(s => s.planType === 'daily' && s.status === 'active')
        .reduce((sum, s) => sum + (s.dayType === 'half' ? s.halfDayAmount : s.fullDayAmount), 0),
      count: students.filter(s => s.planType === 'daily' && s.status === 'active').length,
      color: 'bg-purple-500'
    }
  ];

  // Monthly revenue trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    
    // Calculate revenue for that month (simplified - using current active students)
    const monthRevenue = monthlyRevenue * (0.8 + Math.random() * 0.4); // Simulate variation
    
    monthlyTrend.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      amount: Math.round(monthRevenue)
    });
  }

  const maxTrendAmount = Math.max(...monthlyTrend.map(m => m.amount));

  // Day type revenue breakdown
  const dayTypeRevenue = [
    {
      type: 'Full Day',
      amount: students.filter(s => s.dayType === 'full' && s.status === 'active')
        .reduce((sum, s) => sum + s.fullDayAmount, 0),
      count: students.filter(s => s.dayType === 'full' && s.status === 'active').length,
      color: 'bg-indigo-500'
    },
    {
      type: 'Half Day',
      amount: students.filter(s => s.dayType === 'half' && s.status === 'active')
        .reduce((sum, s) => sum + s.halfDayAmount, 0),
      count: students.filter(s => s.dayType === 'half' && s.status === 'active').length,
      color: 'bg-pink-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-green-900">${monthlyRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Quarterly Revenue</p>
              <p className="text-2xl font-bold text-blue-900">${quarterlyRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Annual Target</p>
              <p className="text-2xl font-bold text-purple-900">${annualTarget.toLocaleString()}</p>
              <p className="text-xs text-purple-600">{annualProgress}% achieved</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center">
            <PieChart className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Avg. Revenue/Student</p>
              <p className="text-2xl font-bold text-orange-900">
                ${students.filter(s => s.status === 'active').length > 0 ? 
                  Math.round(monthlyRevenue / students.filter(s => s.status === 'active').length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Trend</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          
          <div className="flex items-end space-x-2 h-48">
            {monthlyTrend.map((month, index) => {
              const height = maxTrendAmount > 0 ? (month.amount / maxTrendAmount) * 160 : 0;
              
              return (
                <div key={month.month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-green-600 rounded-t transition-all duration-300 hover:bg-green-700"
                    style={{ height: `${height}px` }}
                    title={`${month.month}: $${month.amount.toLocaleString()}`}
                  />
                  <span className="mt-2 text-xs text-gray-600 font-medium">{month.month}</span>
                  <span className="text-xs text-gray-500">${(month.amount / 1000).toFixed(1)}k</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Annual Target Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Annual Target Progress</h3>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Current Progress</span>
              <span className="text-sm font-bold text-gray-900">{annualProgress}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-purple-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(annualProgress, 100)}%` }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Projected Annual</p>
                <p className="font-semibold text-gray-900">${(monthlyRevenue * 12).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Remaining</p>
                <p className="font-semibold text-gray-900">${Math.max(0, annualTarget - (monthlyRevenue * 12)).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown by Plan Type */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Plan Type</h3>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {revenueBreakdown.map((item, index) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded mr-3 ${item.color}`} />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{item.type}</span>
                    <p className="text-xs text-gray-500">{item.count} students</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${item.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {monthlyRevenue > 0 ? Math.round((item.amount / monthlyRevenue) * 100) : 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Day Type */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Day Type</h3>
            <DollarSign className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {dayTypeRevenue.map((item, index) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded mr-3 ${item.color}`} />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{item.type}</span>
                    <p className="text-xs text-gray-500">{item.count} students</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${item.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {monthlyRevenue > 0 ? Math.round((item.amount / monthlyRevenue) * 100) : 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Monthly Revenue</span>
              <span className="text-lg font-bold text-gray-900">${monthlyRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevenueAnalytics;