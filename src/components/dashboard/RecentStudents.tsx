import React from 'react';
import { Users, Clock, MapPin } from 'lucide-react';
import type { Student } from '../../types';
import { apiService } from '../../services/api';

interface RecentStudentsProps {
  students: Student[];
  onRefresh?: () => void;
}

function RecentStudents({ students, onRefresh }: RecentStudentsProps) {
  // Sort by join date (most recent first)
  const recentStudents = students
    .sort((a, b) => {
      const dateA = new Date(a.joinDate || a.startDate);
      const dateB = new Date(b.joinDate || b.startDate);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  // Debug logging
  console.log('Recent Students Data:', {
    totalStudents: students.length,
    recentStudents: recentStudents.map(s => ({
      name: s.name,
      joinDate: s.joinDate,
      startDate: s.startDate
    }))
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getDaysAgo = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Recent Students</h2>
          <p className="text-sm text-gray-600">Latest student registrations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-500" />
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

      {recentStudents.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No students registered yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentStudents.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-medium text-sm">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      Seat {student.seatNumber || 'N/A'}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {getDaysAgo(student.joinDate || student.startDate)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                  {student.status}
                </span>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ₹{student.dayType === 'half' ? student.halfDayAmount : student.fullDayAmount}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {student.dayType} day
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentStudents;