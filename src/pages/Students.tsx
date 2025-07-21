import React, { useState } from 'react';
import { Plus, MessageCircle, AlertTriangle, Search, Filter } from 'lucide-react';
import Button from '../components/ui/Button';
import StudentForm from '../components/students/StudentForm';
import StudentList from '../components/students/StudentList';
import { apiService } from '../services/api';
import type { Student } from '../types';

function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');

  // Load students on component mount
  React.useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getStudents();
      setStudents(data);
    } catch (err) {
      setError('Failed to load students. Please check your database connection.');
      console.error('Error loading students:', err);
      // Set empty array as fallback
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      if (editingStudent) {
        await apiService.updateStudent(editingStudent.id, studentData);
      } else {
        await apiService.createStudent(studentData);
      }
      
      await loadStudents();
      setShowForm(false);
      setEditingStudent(null);
      
      // Show success message
      alert(`Student ${editingStudent ? 'updated' : 'added'} successfully!${studentData.mobile ? ' WhatsApp message sent with seat allocation and WiFi details.' : ''}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${editingStudent ? 'update' : 'add'} student`;
      setError(errorMessage);
      alert(errorMessage);
      console.error('Error saving student:', err);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleSendReminder = async (student: Student) => {
    try {
      await apiService.sendPaymentReminder(
        student.mobile,
        student.name,
        student.dayType === 'half' ? student.halfDayAmount : student.fullDayAmount,
        new Date(student.subscriptionEndDate).toLocaleDateString()
      );
      alert(`Payment reminder sent to ${student.name}`);
    } catch (err) {
      alert('Failed to send reminder');
      console.error('Error sending reminder:', err);
    }
  };

  const getExpiringSoonStudents = () => {
    const now = new Date();
    return students.filter(student => {
      const endDate = new Date(student.subscriptionEndDate);
      const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays > 0;
    });
  };

  const expiringSoonStudents = getExpiringSoonStudents();

  // Filter students based on search and status
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.mobile.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage student registrations and subscriptions</p>
          {expiringSoonStudents.length > 0 && (
            <div className="mt-2 flex items-center text-yellow-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm">{expiringSoonStudents.length} students expiring within 7 days</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
          {/* Search and Filter */}
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search students..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          {/* Action Buttons */}
          {expiringSoonStudents.length > 0 && (
            <Button 
              variant="secondary" 
              onClick={async () => {
                for (const student of expiringSoonStudents) {
                  await handleSendReminder(student);
                }
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Notify Expiring ({expiringSoonStudents.length})</span>
              <span className="sm:hidden">Notify ({expiringSoonStudents.length})</span>
            </Button>
          )}
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Add Student</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {showForm ? (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <StudentForm
              onSubmit={handleAddStudent}
              onCancel={() => {
                setShowForm(false);
                setEditingStudent(null);
              }}
              editingStudent={editingStudent}
            />
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {filteredStudents.length} of {students.length} students
                </p>
                {(searchTerm || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
            <StudentList 
              students={filteredStudents} 
              onEdit={handleEditStudent}
              onSendReminder={handleSendReminder}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Students;