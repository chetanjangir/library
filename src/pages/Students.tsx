import { useState } from 'react';
import { Plus, MessageCircle, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';
import StudentForm from '../components/students/StudentForm';
import StudentList from '../components/students/StudentList';
import type { Student } from '../types';

// Sample data with enhanced fields
const sampleStudents: Student[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    mobile: '+1234567890',
    joinDate: '2023-11-01',
    planType: 'monthly',
    dayType: 'full',
    status: 'active',
    seatNumber: 15,
    subscriptionEndDate: '2024-01-15',
    currency: 'USD',
    monthlyAmount: 100,
    halfDayAmount: 60,
    fullDayAmount: 100
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    mobile: '+1234567891',
    joinDate: '2023-11-05',
    planType: 'monthly',
    dayType: 'half',
    halfDaySlot: 'morning',
    status: 'active',
    seatNumber: 23,
    subscriptionEndDate: '2024-01-10',
    currency: 'USD',
    monthlyAmount: 100,
    halfDayAmount: 60,
    fullDayAmount: 100
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    mobile: '+1234567892',
    joinDate: '2023-11-10',
    planType: 'daily',
    dayType: 'full',
    status: 'expired',
    seatNumber: 7,
    subscriptionEndDate: '2023-12-25',
    currency: 'EUR',
    monthlyAmount: 90,
    halfDayAmount: 55,
    fullDayAmount: 90
  }
];

function Students() {
  const [students, setStudents] = useState<Student[]>(sampleStudents);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: (students.length + 1).toString()
    };
    setStudents([...students, newStudent]);
    setShowForm(false);
    setEditingStudent(null);
    
    // Simulate WhatsApp notification
    alert(`WhatsApp message sent to ${newStudent.name} (${newStudent.mobile}):\n\nWelcome to our library! Your seat ${newStudent.seatNumber} has been allocated.\n\nWiFi Details:\nSSID: LibraryWiFi\nPassword: Study2024\n\nEnjoy your studies!`);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleSendReminder = (student: Student) => {
    alert(`Payment reminder sent to ${student.name} (${student.mobile}):\n\nDear ${student.name}, your subscription expires on ${new Date(student.subscriptionEndDate).toLocaleDateString()}. Please renew to continue using our services.`);
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

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
          {expiringSoonStudents.length > 0 && (
            <div className="mt-2 flex items-center text-yellow-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm">{expiringSoonStudents.length} students expiring within 7 days</span>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          {expiringSoonStudents.length > 0 && (
            <Button 
              variant="secondary" 
              onClick={() => {
                expiringSoonStudents.forEach(student => handleSendReminder(student));
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Notify Expiring ({expiringSoonStudents.length})
            </Button>
          )}
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Student
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
            <StudentList 
              students={students} 
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