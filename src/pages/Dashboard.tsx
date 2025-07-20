import React from 'react';
import StatCard from '../components/dashboard/StatCard';
import PaymentChart from '../components/dashboard/PaymentChart';
import UpcomingPayments from '../components/dashboard/UpcomingPayments';
import type { Statistic } from '../types';

function Dashboard() {
  const stats: Statistic[] = [
    {
      label: 'Total Students',
      value: '156',
      change: 12,
      trend: 'up'
    },
    {
      label: 'Monthly Revenue',
      value: '$8,250',
      change: 8,
      trend: 'up'
    },
    {
      label: 'Seat Occupancy',
      value: '85%',
      change: 5,
      trend: 'up'
    },
    {
      label: 'Payment Due',
      value: '$2,150',
      change: 3,
      trend: 'down'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PaymentChart />
        </div>
        <div>
          <UpcomingPayments />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;