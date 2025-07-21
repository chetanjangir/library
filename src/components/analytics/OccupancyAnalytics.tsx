import React from 'react';
import { MapPin, Users, Calendar, TrendingUp } from 'lucide-react';
import type { Student } from '../../types';

interface OccupancyAnalyticsProps {
  students: Student[];
}

function OccupancyAnalytics({ students }: OccupancyAnalyticsProps) {
  const now = new Date();
  
  // Calculate current occupancy
  const totalSeats = 100;
  const occupiedSeats = students.filter(s => s.status === 'active' && s.seatNumber).length;
  const occupancyRate = Math.round((occupiedSeats / totalSeats) * 100);

  // Seat type breakdown
  const fullDaySeats = students.filter(s => s.status === 'active' && s.dayType === 'full' && s.seatNumber).length;
  const halfDaySeats = students.filter(s => s.status === 'active' && s.dayType === 'half' && s.seatNumber).length;
  const vacantSeats = totalSeats - occupiedSeats;

  // Monthly occupancy trend (last 6 months)
  const monthlyOccupancy = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    
    // Calculate students who were active in that month
    const monthStudents = students.filter(student => {
      const joinDate = new Date(student.joinDate);
      const endDate = new Date(student.subscriptionEndDate);
      return joinDate <= date && endDate >= date && student.seatNumber;
    });
    
    const monthOccupancy = Math.round((monthStudents.length / totalSeats) * 100);
    
    monthlyOccupancy.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      occupancy: monthOccupancy,
      count: monthStudents.length
    });
  }

  const maxOccupancy = Math.max(...monthlyOccupancy.map(m => m.occupancy));

  // Peak hours analysis (simulated data)
  const peakHours = [
    { time: '9-10 AM', occupancy: 85, type: 'peak' },
    { time: '10-11 AM', occupancy: 95, type: 'peak' },
    { time: '11-12 PM', occupancy: 90, type: 'peak' },
    { time: '12-1 PM', occupancy: 70, type: 'moderate' },
    { time: '1-2 PM', occupancy: 60, type: 'low' },
    { time: '2-3 PM', occupancy: 80, type: 'moderate' },
    { time: '3-4 PM', occupancy: 88, type: 'peak' },
    { time: '4-5 PM', occupancy: 92, type: 'peak' },
    { time: '5-6 PM', occupancy: 85, type: 'peak' },
    { time: '6-7 PM', occupancy: 75, type: 'moderate' },
  ];

  // Seat utilization by section (simulated - divide 100 seats into sections)
  const sectionUtilization = [
    { section: 'Section A (1-25)', occupied: Math.min(25, Math.floor(occupiedSeats * 0.3)), total: 25 },
    { section: 'Section B (26-50)', occupied: Math.min(25, Math.floor(occupiedSeats * 0.28)), total: 25 },
    { section: 'Section C (51-75)', occupied: Math.min(25, Math.floor(occupiedSeats * 0.25)), total: 25 },
    { section: 'Section D (76-100)', occupied: Math.min(25, Math.floor(occupiedSeats * 0.17)), total: 25 },
  ];

  return (
    <div className="space-y-6">
      {/* Occupancy Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <MapPin className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Seats</p>
              <p className="text-2xl font-bold text-blue-900">{totalSeats}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Occupied Seats</p>
              <p className="text-2xl font-bold text-green-900">{occupiedSeats}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-purple-900">{occupancyRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Vacant Seats</p>
              <p className="text-2xl font-bold text-orange-900">{vacantSeats}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Occupancy Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Occupancy Trend</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="flex items-end space-x-2 h-48">
            {monthlyOccupancy.map((month, index) => {
              const height = maxOccupancy > 0 ? (month.occupancy / maxOccupancy) * 160 : 0;
              
              return (
                <div key={month.month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-600 rounded-t transition-all duration-300 hover:bg-blue-700"
                    style={{ height: `${height}px` }}
                    title={`${month.month}: ${month.occupancy}% (${month.count} seats)`}
                  />
                  <span className="mt-2 text-xs text-gray-600 font-medium">{month.month}</span>
                  <span className="text-xs text-gray-500">{month.occupancy}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seat Type Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Seat Type Distribution</h3>
            <MapPin className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded mr-3 bg-red-500" />
                <span className="text-sm font-medium text-gray-900">Full Day Seats</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{fullDaySeats}</p>
                <p className="text-xs text-gray-500">{Math.round((fullDaySeats / totalSeats) * 100)}%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded mr-3 bg-yellow-500" />
                <span className="text-sm font-medium text-gray-900">Half Day Seats</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{halfDaySeats}</p>
                <p className="text-xs text-gray-500">{Math.round((halfDaySeats / totalSeats) * 100)}%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded mr-3 bg-green-500" />
                <span className="text-sm font-medium text-gray-900">Vacant Seats</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{vacantSeats}</p>
                <p className="text-xs text-gray-500">{Math.round((vacantSeats / totalSeats) * 100)}%</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="flex h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-red-500" 
                  style={{ width: `${(fullDaySeats / totalSeats) * 100}%` }}
                />
                <div 
                  className="bg-yellow-500" 
                  style={{ width: `${(halfDaySeats / totalSeats) * 100}%` }}
                />
                <div 
                  className="bg-green-500" 
                  style={{ width: `${(vacantSeats / totalSeats) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Peak Hours Analysis</h3>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-3">
            {peakHours.map((hour, index) => (
              <div key={hour.time} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{hour.time}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className={`h-2 rounded-full ${
                        hour.type === 'peak' ? 'bg-red-500' :
                        hour.type === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${hour.occupancy}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12">{hour.occupancy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Utilization */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Section Utilization</h3>
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {sectionUtilization.map((section, index) => {
              const utilization = Math.round((section.occupied / section.total) * 100);
              
              return (
                <div key={section.section} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{section.section}</span>
                    <span className="text-sm text-gray-600">{section.occupied}/{section.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        utilization >= 80 ? 'bg-red-500' :
                        utilization >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">{utilization}% utilized</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OccupancyAnalytics;