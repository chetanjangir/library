import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, TrendingUp, Plus, Bell, Search, BarChart3 } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import StudentGrowthChart from '../components/dashboard/StudentGrowthChart';
import RecentStudents from '../components/dashboard/RecentStudents';
import QuickActions from '../components/dashboard/QuickActions';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Student, Statistic } from '../types';

function Dashboard() {
  const { isAdmin, user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (isAdmin()) {
        // Admin sees all data
        const [studentsData, paymentsData] = await Promise.all([
          apiService.getStudents(),
          apiService.getPayments()
        ]);
        setStudents(studentsData);
        setPayments(paymentsData);
      } else {
        // Student sees only their own data
        const [studentsData, paymentsData] = await Promise.all([
          apiService.getStudents(),
          apiService.getPayments()
        ]);
        
        // Filter to show only current student's data
        const currentStudent = studentsData.find(s => s.id === user?.studentId);
        const studentPayments = paymentsData.filter(p => p.studentId === user?.studentId);
        
        setStudents(currentStudent ? [currentStudent] : []);
        setPayments(studentPayments);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const activeStudents = students.filter(s => s.status === 'active');
  
  // Calculate revenue from MongoDB data
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const monthlyRevenue = isAdmin() ? 
    activeStudents.reduce((sum, student) => {
      const amount = student.dayType === 'half' ? student.halfDayAmount : student.fullDayAmount;
      return sum + amount;
    }, 0) : 
    (students[0]?.dayType === 'half' ? students[0]?.halfDayAmount || 0 : students[0]?.fullDayAmount || 0);

  const expiringSoon = students.filter(student => {
    const endDate = new Date(student.subscriptionEndDate);
    const now = new Date();
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  });

  const expiredStudents = students.filter(student => {
    const endDate = new Date(student.subscriptionEndDate);
    const now = new Date();
    return endDate < now;
  });

  const occupancyRate = isAdmin() ? Math.round((activeStudents.length / 100) * 100) : 0;

  // New students this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newThisMonth = students.filter(student => {
    const joinDate = new Date(student.joinDate);
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
  }).length;

  // Calculate payment statistics
  const totalCollected = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalDues = payments.filter(p => p.status === 'pending' || p.status === 'due').reduce((sum, p) => sum + p.amount, 0);
  const overdue = payments.filter(p => p.status === 'overdue' || p.status === 'expired').reduce((sum, p) => sum + p.amount, 0);

  const adminStats: Statistic[] = [
    {
      label: 'Active Students',
      value: activeStudents.length.toString(),
      change: newThisMonth > 0 ? Math.round((newThisMonth / activeStudents.length) * 100) : 0,
      trend: 'up'
    },
    {
      label: 'Monthly Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      change: 8,
      trend: 'up'
    },
    {
      label: 'Seat Occupancy',
      value: `${occupancyRate}%`,
      change: 5,
      trend: 'up'
    },
    {
      label: 'Payment Collection',
      value: `$${totalCollected.toLocaleString()}`,
      change: totalDues > 0 ? Math.round((totalCollected / (totalCollected + totalDues)) * 100) : 100,
      trend: totalDues > 0 ? 'up' : 'down'
    }
  ];

  const studentStats: Statistic[] = [
    {
      label: 'My Status',
      value: students[0]?.status || 'N/A',
      change: 0,
      trend: 'up'
    },
    {
      label: 'Monthly Fee',
      value: `$${monthlyRevenue}`,
      change: 0,
      trend: 'up'
    },
    {
      label: 'Payments Due',
      value: `$${totalDues}`,
      change: 0,
      trend: totalDues > 0 ? 'down' : 'up'
    },
    {
      label: 'Seat Number',
      value: students[0]?.seatNumber?.toString() || 'N/A',
      change: 0,
      trend: 'up'
    }
  ];

  const stats = isAdmin() ? adminStats : studentStats;
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin() ? 'Admin Dashboard' : 'Student Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin() 
              ? "Welcome back! Here's what's happening with your library." 
              : `Welcome back, ${user?.name}! Here's your account overview.`
            }
          </p>
        </div>
        {isAdmin() && (
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button 
              onClick={() => window.location.href = '/analytics'}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </button>
            <button 
              onClick={() => window.location.href = '/students'}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Alerts */}
      {isAdmin() && (expiringSoon.length > 0 || expiredStudents.length > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">Subscription Alerts</h3>
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            {expiringSoon.length > 0 && (
              <p>{expiringSoon.length} students have subscriptions expiring within 7 days.</p>
            )}
            {expiredStudents.length > 0 && (
              <p>{expiredStudents.length} students have expired subscriptions.</p>
            )}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueChart students={students} payments={payments} />
        </div>

        {/* Quick Actions */}
        {isAdmin() && (
          <div>
            <QuickActions 
              expiringSoon={expiringSoon.length}
              expired={expiredStudents.length}
              onRefresh={loadDashboardData}
            />
          </div>
        )}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Growth Chart */}
        {isAdmin() && <StudentGrowthChart students={students} />}
        
        {/* Recent Students */}
        {isAdmin() ? (
          <RecentStudents students={students.slice(0, 5)} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Account Details</h2>
            {students[0] && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{students[0].name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{students[0].email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mobile:</span>
                  <span className="font-medium">{students[0].mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seat Number:</span>
                  <span className="font-medium">{students[0].seatNumber || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan Type:</span>
                  <span className="font-medium capitalize">{students[0].planType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Day Type:</span>
                  <span className="font-medium capitalize">{students[0].dayType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subscription Ends:</span>
                  <span className="font-medium">{new Date(students[0].subscriptionEndDate).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;