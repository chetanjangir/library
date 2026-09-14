import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Bell, Search, AlertTriangle, XCircle, CheckCircle2, UserPlus } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import PaymentCollectionCard from '../components/dashboard/PaymentCollectionCard';
import StudentGrowthChart from '../components/dashboard/StudentGrowthChart';
import RecentStudents from '../components/dashboard/RecentStudents';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { computeDueInfo } from '../utils/dues';
import type { Student, Statistic } from '../types';

function Dashboard() {
  const { isAdmin, user } = useAuth();
  const admin = isAdmin();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const studentsData = await apiService.getStudents();

      if (admin) {
        setStudents(studentsData);
      } else {
        const currentStudent = studentsData.find((s: Student) => s.id === user?.studentId);
        setStudents(currentStudent ? [currentStudent] : []);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const activeStudents = students.filter(s => s.status === 'active');

  const expiringSoon = students.filter(student => {
    const diffDays = Math.ceil((new Date(student.subscriptionEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  });

  const studentsWithDues = students.filter(s => s.status !== 'inactive' && computeDueInfo(s).due > 0);

  const startOfWeek = (() => {
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
  })();

  const paidThisWeek = students.reduce((count, s) => {
    const hasPaymentThisWeek = (s.paymentHistory || []).some(p => new Date(p.date) >= startOfWeek);
    return hasPaymentThisWeek ? count + 1 : count;
  }, 0);

  const newThisWeek = students.filter(s => new Date(s.createdAt || s.joinDate) >= startOfWeek).length;

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyRevenue = students.reduce((sum, s) => {
    const paidThisMonth = (s.paymentHistory || [])
      .filter(p => {
        const d = new Date(p.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((a, p) => a + (p.amount || 0), 0);
    return sum + paidThisMonth;
  }, 0);
  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonthRevenue = students.reduce((sum, s) => {
    const paid = (s.paymentHistory || [])
      .filter(p => {
        const d = new Date(p.date);
        return d.getMonth() === prevMonthDate.getMonth() && d.getFullYear() === prevMonthDate.getFullYear();
      })
      .reduce((a, p) => a + (p.amount || 0), 0);
    return sum + paid;
  }, 0);
  const revenueChangePct = prevMonthRevenue > 0
    ? Math.round(((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
    : (monthlyRevenue > 0 ? 100 : 0);

  const occupancyRate = admin && students.length > 0
    ? Math.round((students.filter(s => s.seatNumber).length / 100) * 100)
    : 0;

  const totalCollected = students.reduce((sum, s) => sum + computeDueInfo(s).totalPaid, 0);
  const totalDue = studentsWithDues.reduce((sum, s) => sum + computeDueInfo(s).due, 0);
  const collectionPct = (totalCollected + totalDue) > 0
    ? Math.round((totalCollected / (totalCollected + totalDue)) * 100)
    : 100;

  const adminStats: Statistic[] = [
    { label: 'Active Students', value: activeStudents.length.toString(), change: newThisWeek, trend: 'up', icon: 'users', color: 'indigo' },
    { label: 'Monthly Revenue', value: `₹${monthlyRevenue.toLocaleString()}`, change: revenueChangePct, trend: revenueChangePct >= 0 ? 'up' : 'down', icon: 'rupee', color: 'green' },
    { label: 'Seat Occupancy', value: `${occupancyRate}%`, change: occupancyRate, trend: 'up', icon: 'seat', color: 'blue' },
    { label: 'Payment Collection', value: `${collectionPct}%`, change: collectionPct, trend: collectionPct >= 90 ? 'up' : 'down', icon: 'card', color: 'amber' }
  ];

  const studentDue = students[0] ? computeDueInfo(students[0]).due : 0;
  const studentStats: Statistic[] = [
    { label: 'My Status', value: students[0]?.status || 'N/A', change: 0, trend: 'up', icon: 'users', color: 'indigo' },
    { label: 'Cycle Amount', value: `₹${students[0] ? computeDueInfo(students[0]).cycleAmount : 0}`, change: 0, trend: 'up', icon: 'rupee', color: 'green' },
    { label: 'Payments Due', value: `₹${studentDue.toFixed(0)}`, change: 0, trend: studentDue > 0 ? 'down' : 'up', icon: 'card', color: 'amber' },
    { label: 'Seat Number', value: students[0]?.seatNumber?.toString() || 'N/A', change: 0, trend: 'up', icon: 'seat', color: 'blue' }
  ];

  const stats = admin ? adminStats : studentStats;
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-0.5">{greeting}, {user?.name?.split(' ')[0] || 'there'}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search anything..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-56 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              readOnly
              onFocus={(e) => e.target.blur()}
              onClick={() => window.location.href = '/students'}
            />
          </div>
          <Link
            to="/expiring"
            className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
            title="Alerts"
          >
            <Bell className="w-5 h-5" />
            {expiringSoon.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Link>
          {admin && (
            <Link
              to="/students"
              className="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Link>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Alerts */}
      {admin && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Alerts</h3>
            <p className="text-xs text-gray-500">Items that need your attention</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/expiring" className="bg-amber-50 border border-amber-200 rounded-xl p-4 hover:border-amber-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-amber-800 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4 mr-1.5" />
                  Expiring soon
                </div>
                <span className="text-lg font-semibold text-amber-800">{expiringSoon.length}</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">subscriptions expire this week</p>
            </Link>

            <Link to="/dues" className="bg-red-50 border border-red-200 rounded-xl p-4 hover:border-red-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-red-800 text-sm font-medium">
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Dues pending
                </div>
                <span className="text-lg font-semibold text-red-800">{studentsWithDues.length}</span>
              </div>
              <p className="text-xs text-red-700 mt-1">students with outstanding balance</p>
            </Link>

            <Link to="/payments" className="bg-green-50 border border-green-200 rounded-xl p-4 hover:border-green-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-green-800 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Paid this week
                </div>
                <span className="text-lg font-semibold text-green-800">{paidThisWeek}</span>
              </div>
              <p className="text-xs text-green-700 mt-1">students recorded a payment</p>
            </Link>

            <Link to="/students" className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-blue-800 text-sm font-medium">
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  New this week
                </div>
                <span className="text-lg font-semibold text-blue-800">{newThisWeek}</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">students joined this week</p>
            </Link>
          </div>
        </div>
      )}

      {admin ? (
        <>
          {/* Revenue + Payment Collection */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChart students={students} onRefresh={loadDashboardData} />
            </div>
            <div>
              <PaymentCollectionCard students={students} />
            </div>
          </div>

          {/* Student Growth + Recent Students */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StudentGrowthChart students={students} />
            <RecentStudents students={students} />
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
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
  );
}

export default Dashboard;
