import React, { useState, useEffect } from 'react';
import { BarChart3, Users, DollarSign, MapPin, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { apiService } from '../services/api';
import PaymentsAnalytics from '../components/analytics/PaymentsAnalytics';
import StudentsAnalytics from '../components/analytics/StudentsAnalytics';
import RevenueAnalytics from '../components/analytics/RevenueAnalytics';
import OccupancyAnalytics from '../components/analytics/OccupancyAnalytics';
import type { Student, Payment } from '../types';

type AnalyticsTab = 'payments' | 'students' | 'revenue' | 'occupancy';

function Analytics() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('payments');
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
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
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'payments', label: 'Payments', icon: CreditCard, color: 'text-blue-600' },
    { id: 'students', label: 'Students', icon: Users, color: 'text-green-600' },
    { id: 'revenue', label: 'Revenue', icon: DollarSign, color: 'text-purple-600' },
    { id: 'occupancy', label: 'Occupancy', icon: MapPin, color: 'text-orange-600' },
  ];

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      );
    }

    switch (activeTab) {
      case 'payments':
        return <PaymentsAnalytics payments={payments} students={students} />;
      case 'students':
        return <StudentsAnalytics students={students} />;
      case 'revenue':
        return <RevenueAnalytics students={students} payments={payments} />;
      case 'occupancy':
        return <OccupancyAnalytics students={students} />;
      default:
        return null;
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-indigo-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your library operations</p>
        </div>
        <button 
          onClick={loadAnalyticsData}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mt-4 sm:mt-0"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AnalyticsTab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? tab.color : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default Analytics;