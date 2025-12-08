import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Map, Calendar, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function Sidebar() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const adminLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/students', icon: Users, label: 'Students' },
    { to: '/expiring', icon: Calendar, label: 'Expiring' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
    { to: '/seats', icon: Map, label: 'Seat Map' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const studentLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/payments', icon: CreditCard, label: 'My Payments' },
  ];

  const links = isAdmin() ? adminLinks : studentLinks;
  return (
    <aside className="w-full lg:w-64 bg-white shadow-sm lg:h-[calc(100vh-4rem)]">
      <nav className="mt-2 lg:mt-5 px-2">
        <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-x-visible">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`group flex items-center px-3 py-2 text-sm lg:text-base font-medium rounded-md whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-2 lg:mr-3 h-5 w-5 lg:h-6 lg:w-6 flex-shrink-0" />
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          );
        })}
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;