import React, { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, MessageCircle, Clock, Phone, CheckSquare, Square } from 'lucide-react';
import Button from '../components/ui/Button';
import { apiService } from '../services/api';
import type { Student } from '../types';

function Expiring() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    loadExpiringStudents();
  }, []);

  const loadExpiringStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const allStudents = await apiService.getStudents();
      
      // Filter students with expiring or expired subscriptions
      const now = new Date();
      const expiringStudents = allStudents.filter(student => {
        const endDate = new Date(student.subscriptionEndDate);
        const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 30; // Show students expiring within 30 days or already expired
      });

      // Sort by urgency (expired first, then by days remaining)
      expiringStudents.sort((a, b) => {
        const aDays = Math.ceil((new Date(a.subscriptionEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const bDays = Math.ceil((new Date(b.subscriptionEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return aDays - bDays;
      });

      setStudents(expiringStudents);
    } catch (err) {
      setError('Failed to load expiring students');
      console.error('Error loading expiring students:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getUrgencyLevel = (daysRemaining: number) => {
    if (daysRemaining < 0) return 'expired';
    if (daysRemaining <= 3) return 'critical';
    if (daysRemaining <= 7) return 'warning';
    return 'notice';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'notice': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyBadge = (urgency: string, daysRemaining: number) => {
    switch (urgency) {
      case 'expired': return { text: 'EXPIRED', color: 'bg-red-500' };
      case 'critical': return { text: `${daysRemaining}D LEFT`, color: 'bg-red-500' };
      case 'warning': return { text: `${daysRemaining}D LEFT`, color: 'bg-yellow-500' };
      case 'notice': return { text: `${daysRemaining}D LEFT`, color: 'bg-blue-500' };
      default: return { text: 'OK', color: 'bg-green-500' };
    }
  };

  const handleSendReminder = async (student: Student) => {
    try {
      await apiService.sendPaymentReminder(
        student.mobile,
        student.name,
        student.dayType === 'half' ? student.halfDayAmount : student.fullDayAmount,
        new Date(student.subscriptionEndDate).toLocaleDateString()
      );
      alert(`Reminder sent to ${student.name}`);
    } catch (err) {
      alert('Failed to send reminder');
      console.error('Error sending reminder:', err);
    }
  };

  const handleBulkReminders = async () => {
    setSendingReminders(true);
    try {
      for (const student of students) {
        await handleSendReminder(student);
        // Add small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      alert(`Reminders sent to ${students.length} students`);
    } catch (err) {
      alert('Failed to send bulk reminders');
      console.error('Error sending bulk reminders:', err);
    } finally {
      setSendingReminders(false);
    }
  };

  // Group students by urgency
  const expiredStudents = students.filter(s => getDaysRemaining(s.subscriptionEndDate) < 0);
  const criticalStudents = students.filter(s => {
    const days = getDaysRemaining(s.subscriptionEndDate);
    return days >= 0 && days <= 3;
  });
  const warningStudents = students.filter(s => {
    const days = getDaysRemaining(s.subscriptionEndDate);
    return days > 3 && days <= 7;
  });
  const noticeStudents = students.filter(s => {
    const days = getDaysRemaining(s.subscriptionEndDate);
    return days > 7 && days <= 30;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading expiring subscriptions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expiring Subscriptions</h1>
          <p className="text-gray-600 mt-1">Monitor and manage subscription renewals</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button 
            variant="secondary" 
            onClick={loadExpiringStudents}
          >
            <Clock className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {students.length > 0 && (
            <Button 
              onClick={handleBulkReminders}
              disabled={sendingReminders}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {sendingReminders ? 'Sending...' : `Send All Reminders (${students.length})`}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Expired</p>
              <p className="text-2xl font-bold text-red-900">{expiredStudents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Critical (≤3 days)</p>
              <p className="text-2xl font-bold text-red-900">{criticalStudents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Warning (≤7 days)</p>
              <p className="text-2xl font-bold text-yellow-900">{warningStudents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Notice (≤30 days)</p>
              <p className="text-2xl font-bold text-blue-900">{noticeStudents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Expiring Subscriptions</h3>
          <p className="text-gray-500">All student subscriptions are current and up to date.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => {
                  const daysRemaining = getDaysRemaining(student.subscriptionEndDate);
                  const urgency = getUrgencyLevel(daysRemaining);
                  const badge = getUrgencyBadge(urgency, daysRemaining);
                  
                  return (
                    <tr key={student.id} className={`${getUrgencyColor(urgency)} border-l-4`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleSelectStudent(student.id)}
                          className="flex items-center"
                        >
                          {selectedStudents.has(student.id) ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {student.mobile}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Seat {student.seatNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {student.dayType} day
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Expires: {new Date(student.subscriptionEndDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${student.dayType === 'half' ? student.halfDayAmount : student.fullDayAmount}/month
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${badge.color}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="secondary"
                          onClick={() => handleSendReminder(student)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Send Reminder
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expiring;