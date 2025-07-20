import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import type { Statistic } from '../../types';

interface StatCardProps {
  stat: Statistic;
}

function StatCard({ stat }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
        </div>
        <div className={`flex items-center ${
          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {stat.trend === 'up' ? (
            <ArrowUpIcon className="w-4 h-4" />
          ) : (
            <ArrowDownIcon className="w-4 h-4" />
          )}
          <span className="ml-1 text-sm font-medium">{stat.change}%</span>
        </div>
      </div>
    </div>
  );
}

export default StatCard