import { BookOpen } from 'lucide-react';

function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-lg sm:text-xl font-semibold">
              <span className="hidden sm:inline">Library Management</span>
              <span className="sm:hidden">Library</span>
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;