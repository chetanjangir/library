import React from 'react';
import { Plus, Bell, Users, Calendar, MessageCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  expiringSoon: number;
  expired: number;
  onRefresh: () => void;
}

function QuickActions({ expiringSoon, expired, onRefresh }: QuickActionsProps) {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Plus,
      label: 'Add Student',
      description: 'Register new student',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      onClick: () => navigate('/students')
    },
    {
      icon: Bell,
      label: 'Expiring Soon',
      description: `${expiringSoon} students`,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      onClick: () => navigate('/expiring'),
      badge: expiringSoon > 0 ? expiringSoon : undefined
    },
    {
      icon: Users,
      label: 'All Students',
      description: 'Manage students',
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => navigate('/students')
    },
    {
      icon: Calendar,
      label: 'Payments',
      description: 'Track payments',
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => navigate('/payments')
    },
    {
      icon: MessageCircle,
      label: 'Send Reminders',
      description: 'WhatsApp notifications',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => {
        // Simulate sending reminders
        alert(`Sending reminders to ${expiringSoon + expired} students`);
      },
      disabled: expiringSoon + expired === 0
    },
    {
      icon: FileText,
      label: 'Seat Map',
      description: 'View seat allocation',
      color: 'bg-gray-600 hover:bg-gray-700',
      onClick: () => navigate('/seats')
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-600">Common tasks and shortcuts</p>
        </div>
        <button 
          onClick={onRefresh}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="Refresh data"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`
                relative flex items-center p-4 rounded-lg text-white transition-colors text-left
                ${action.disabled ? 'bg-gray-400 cursor-not-allowed' : action.color}
              `}
            >
              <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{action.label}</p>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
              {action.badge && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {action.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuickActions;