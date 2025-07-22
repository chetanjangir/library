import React from 'react';
import { BookOpen, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-shrink-0">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-lg sm:text-xl font-semibold">
              <span className="hidden sm:inline">Library Management</span>
              <span className="sm:hidden">Library</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="hidden sm:flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-500" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;