import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, TrendingUp, Plus, Bell, Search, BarChart3 } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import StudentGrowthChart from '../components/dashboard/StudentGrowthChart';
import RecentStudents from '../components/dashboard/RecentStudents';
import QuickActions from '../components/dashboard/QuickActions';
import { apiService } from '../services/api';
import type { Student, Statistic } from '../types';

function Dashboard() {
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
      const [studentsData, paymentsData] = await Promise.all([
        apiService.getStudents(),
        apiService.getPayments()
      ]);
      setStudents(studentsData);
      setPayments(paymentsData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const activeStudents = students.filter(s => s.status === 'active');
  const totalRevenue = activeStudents.reduce((sum, student) => {
    const amount = student.dayType === 'half' ? student.halfDayAmount : student.fullDayAmount;
    return sum + amount;
  }, 0);

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

  const occupancyRate = Math.round((activeStudents.length / 100) * 100);

  // New students this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newThisMonth = students.filter(student => {
    const joinDate = new Date(student.joinDate);
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
  }).length;

  // Calculate payment statistics
  const totalCollected = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalDues = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const overdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  const stats: Statistic[] = [
    {
      label: 'Active Students',
      value: activeStudents.length.toString(),
      change: newThisMonth > 0 ? Math.round((newThisMonth / activeStudents.length) * 100) : 0,
      trend: 'up'
    },
    {
      label: 'Monthly Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your library.</p>
        </div>
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
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Alerts */}
      {(expiringSoon.length > 0 || expiredStudents.length > 0) && (
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
        <div>
          <QuickActions 
            expiringSoon={expiringSoon.length}
            expired={expiredStudents.length}
            onRefresh={loadDashboardData}
          />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Growth Chart */}
        <StudentGrowthChart students={students} />
        
        {/* Recent Students */}
        <RecentStudents students={students.slice(0, 5)} />
      </div>
    </div>
  );
}

export default Dashboard;