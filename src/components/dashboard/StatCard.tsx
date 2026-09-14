import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, Users, IndianRupee, Armchair, CreditCard } from 'lucide-react';
import type { Statistic } from '../../types';

interface StatCardProps {
  stat: Statistic;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  rupee: IndianRupee,
  seat: Armchair,
  card: CreditCard
};

const COLORS: Record<string, string> = {
  indigo: 'bg-indigo-100 text-indigo-600',
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
  amber: 'bg-amber-100 text-amber-600'
};

function StatCard({ stat }: StatCardProps) {
  const Icon = stat.icon ? ICONS[stat.icon] : undefined;
  const colorClass = COLORS[stat.color || 'indigo'];

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{stat.value}</p>
      <div className={`mt-2 flex items-center text-sm font-medium ${
        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
      }`}>
        {stat.trend === 'up' ? (
          <ArrowUpIcon className="w-3.5 h-3.5" />
        ) : (
          <ArrowDownIcon className="w-3.5 h-3.5" />
        )}
        <span className="ml-1">{stat.change}%</span>
        <span className="ml-1.5 text-gray-400 font-normal text-xs">vs last month</span>
      </div>
    </div>
  );
}

export default StatCard;
