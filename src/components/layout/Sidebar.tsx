import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, Map, Calendar, BarChart3, Settings,
  AlertCircle, BookOpen, LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function Sidebar() {
  const location = useLocation();
  const { isAdmin, user, logout } = useAuth();

  const adminLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/students', icon: Users, label: 'Students' },
    { to: '/expiring', icon: Calendar, label: 'Expiring' },
    { to: '/dues', icon: AlertCircle, label: 'Dues' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
    { to: '/seats', icon: Map, label: 'Seat Map' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const studentLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/payments', icon: CreditCard, label: 'My Payments' },
  ];

  const links = isAdmin() ? adminLinks : studentLinks;

  const initials = (user?.name || '?')
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-gray-200 lg:h-screen lg:sticky lg:top-0 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">Samarth Library</p>
          <p className="text-xs text-gray-500">{isAdmin() ? 'Admin portal' : 'Student portal'}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Workspace</p>
        <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-700 text-sm font-semibold">{initials}</span>
          </div>
          <div className="min-w-0 flex-1 hidden sm:block">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors flex-shrink-0"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
