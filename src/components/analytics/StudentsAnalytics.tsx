import React from 'react';
import { Users, UserPlus, TrendingUp, UserCheck, Calendar } from 'lucide-react';
import type { Student } from '../../types';

interface StudentsAnalyticsProps {
  students: Student[];
}

function StudentsAnalytics({ students }: StudentsAnalyticsProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate statistics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  
  // New students this month
  const newThisMonth = students.filter(student => {
    const joinDate = new Date(student.joinDate);
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
  }).length;

  // Retention rate (students who renewed after first month)
  const studentsOlderThanMonth = students.filter(student => {
    const joinDate = new Date(student.joinDate);
    const monthsAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return joinDate < monthsAgo;
  });
  
  const retainedStudents = studentsOlderThanMonth.filter(s => s.status === 'active').length;
  const retentionRate = studentsOlderThanMonth.length > 0 ? 
    Math.round((retainedStudents / studentsOlderThanMonth.length) * 100) : 0;

  // Monthly growth data (last 6 months)
  const monthlyGrowth = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStudents = students.filter(student => {
      const joinDate = new Date(student.joinDate);
      return joinDate.getMonth() === date.getMonth() && 
             joinDate.getFullYear() === date.getFullYear();
    });
    
    monthlyGrowth.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      count: monthStudents.length,
      cumulative: students.filter(student => {
        const joinDate = new Date(student.joinDate);
        return joinDate <= date;
      }).length
    });
  }

  const maxGrowthCount = Math.max(...monthlyGrowth.map(m => m.count));

  // Student status breakdown
  const statusBreakdown = [
    { status: 'Active', count: activeStudents, color: 'bg-green-500', percentage: Math.round((activeStudents / totalStudents) * 100) },
    { status: 'Inactive', count: students.filter(s => s.status === 'inactive').length, color: 'bg-gray-500', percentage: Math.round((students.filter(s => s.status === 'inactive').length / totalStudents) * 100) },
    { status: 'Expired', count: students.filter(s => s.status === 'expired').length, color: 'bg-red-500', percentage: Math.round((students.filter(s => s.status === 'expired').length / totalStudents) * 100) },
  ];

  // Day type breakdown
  const dayTypeBreakdown = [
    { type: 'Full Day', count: students.filter(s => s.dayType === 'full').length, color: 'bg-blue-500' },
    { type: 'Half Day', count: students.filter(s => s.dayType === 'half').length, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Student Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-900">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Active Students</p>
              <p className="text-2xl font-bold text-green-900">{activeStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center">
            <UserPlus className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">New This Month</p>
              <p className="text-2xl font-bold text-purple-900">{newThisMonth}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Retention Rate</p>
              <p className="text-2xl font-bold text-orange-900">{retentionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Student Growth */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Student Growth</h3>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="flex items-end space-x-2 h-48">
            {monthlyGrowth.map((month, index) => {
              const height = maxGrowthCount > 0 ? (month.count / maxGrowthCount) * 160 : 0;
              
              return (
                <div key={month.month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-purple-600 rounded-t transition-all duration-300 hover:bg-purple-700"
                    style={{ height: `${height}px` }}
                    title={`${month.month}: ${month.count} new students`}
                  />
                  <span className="mt-2 text-xs text-gray-600 font-medium">{month.month}</span>
                  <span className="text-xs text-gray-500">{month.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Student Status Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Student Status Breakdown</h3>
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {statusBreakdown.map((item, index) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded mr-3 ${item.color}`} />
                  <span className="text-sm font-medium text-gray-900">{item.status}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{item.count}</p>
                  <p className="text-xs text-gray-500">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Day Type Distribution</h4>
            <div className="space-y-2">
              {dayTypeBreakdown.map((item, index) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded mr-2 ${item.color}`} />
                    <span className="text-sm text-gray-700">{item.type}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Students Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Student Registrations</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students
                .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
                .slice(0, 10)
                .map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(student.joinDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{student.planType}</div>
                      <div className="text-sm text-gray-500 capitalize">{student.dayType} day</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' :
                        student.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.seatNumber ? `Seat ${student.seatNumber}` : 'Not assigned'}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentsAnalytics;