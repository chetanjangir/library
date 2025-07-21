import React from 'react';
import { Users, TrendingUp } from 'lucide-react';
import type { Student } from '../../types';

interface StudentGrowthChartProps {
  students: Student[];
}

function StudentGrowthChart({ students }: StudentGrowthChartProps) {
  const now = new Date();
  
  // Generate last 6 months data
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStudents = students.filter(student => {
      const joinDate = new Date(student.joinDate);
      return joinDate.getMonth() === date.getMonth() && 
             joinDate.getFullYear() === date.getFullYear();
    });
    
    months.push({
      name: date.toLocaleDateString('en-US', { month: 'short' }),
      value: monthStudents.length,
      cumulative: students.filter(student => {
        const joinDate = new Date(student.joinDate);
        return joinDate <= date;
      }).length
    });
  }

  const maxValue = Math.max(...months.map(m => m.value));
  const totalGrowth = months[months.length - 1]?.cumulative - months[0]?.cumulative || 0;
  const growthRate = months[0]?.cumulative > 0 ? 
    Math.round((totalGrowth / months[0].cumulative) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Student Growth</h2>
          <p className="text-sm text-gray-600">New student registrations over time</p>
        </div>
        <Users className="w-5 h-5 text-blue-600" />
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
                  isCurrentMonth ? 'bg-blue-600' : 'bg-blue-400'
                }`}
                style={{ height: `${height}px` }}
                title={`${month.name}: ${month.value} new students`}
              />
              <span className="mt-2 text-xs text-gray-600 font-medium">{month.name}</span>
              <span className="text-xs text-gray-500">{month.value}</span>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Users className="w-4 h-4 text-gray-500 mr-1" />
          </div>
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-lg font-semibold text-gray-900">
            {months[months.length - 1]?.value || 0}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          </div>
          <p className="text-sm text-gray-600">Growth Rate</p>
          <p className="text-lg font-semibold text-gray-900">{growthRate}%</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Users className="w-4 h-4 text-blue-500 mr-1" />
          </div>
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-lg font-semibold text-gray-900">{students.length}</p>
        </div>
      </div>
    </div>
  );
}

export default StudentGrowthChart;