import React from 'react';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Student } from '../../types';

interface RecentStudentsProps {
  students: Student[];
}

function RecentStudents({ students }: RecentStudentsProps) {
  const recentStudents = [...students]
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.joinDate || a.startDate).getTime();
      const dateB = new Date(b.createdAt || b.joinDate || b.startDate).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Recent Students</h2>
          <p className="text-sm text-gray-500">Latest student registrations</p>
        </div>
        <Link to="/students" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
          View all
          <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {recentStudents.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No students registered yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-2 pb-2">Student</th>
                <th className="px-2 pb-2 hidden sm:table-cell">Plan</th>
                <th className="px-2 pb-2 hidden md:table-cell">Joined</th>
                <th className="px-2 pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {student.photo ? (
                          <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-indigo-600 font-medium text-xs">{student.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[9rem]">{student.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[9rem]">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 hidden sm:table-cell">
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">
                      {student.planType}
                    </span>
                  </td>
                  <td className="px-2 py-3 hidden md:table-cell text-sm text-gray-600">
                    {new Date(student.createdAt || student.joinDate || student.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusColor(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RecentStudents;
