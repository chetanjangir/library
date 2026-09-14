import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Student } from '../../types';

interface StudentGrowthChartProps {
  students: Student[];
}

function StudentGrowthChart({ students }: StudentGrowthChartProps) {
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStudents = students.filter(student => {
      const joinDate = new Date(student.createdAt || student.joinDate);
      return joinDate.getMonth() === date.getMonth() && joinDate.getFullYear() === date.getFullYear();
    });

    months.push({
      name: date.toLocaleDateString('en-US', { month: 'short' }),
      value: monthStudents.length
    });
  }

  const totalGrowth = months.reduce((sum, m) => sum + m.value, 0);
  const thisMonth = months[months.length - 1]?.value || 0;
  const prevMonth = months[months.length - 2]?.value || 0;
  const growthPct = prevMonth > 0 ? Math.round(((thisMonth - prevMonth) / prevMonth) * 100) : (thisMonth > 0 ? 100 : 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Student Growth</h2>
          <p className="text-sm text-gray-500">New registrations over time</p>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-semibold text-gray-900">{totalGrowth}</span>
        <span className={`text-sm font-medium ${growthPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {growthPct >= 0 ? '+' : ''}{growthPct}% this period
        </span>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={months} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
            <Tooltip formatter={(value: number) => [value, 'New students']} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {months.map((month, index) => (
                <Cell key={month.name} fill={index === months.length - 1 ? '#4f46e5' : '#c7d2fe'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StudentGrowthChart;
