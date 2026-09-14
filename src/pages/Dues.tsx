import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { apiService } from '../services/api';
import DuesTable from '../components/payments/DuesTable';
import PaymentHistoryModal from '../components/students/PaymentHistoryModal';
import type { Student } from '../types';

function Dues() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const { toasts, removeToast } = useToast();

  useEffect(() => {
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
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dues...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
          <AlertCircle className="w-6 h-6 mr-2 text-red-500" />
          Payment Dues
        </h1>
        <p className="text-gray-600 mt-1">Students with outstanding balances, calculated month-wise from their join date.</p>
      </div>

      <div className="mt-6">
        <DuesTable students={students} onChanged={loadStudents} onShowHistory={setHistoryStudent} />
      </div>

      {historyStudent && (
        <PaymentHistoryModal student={historyStudent} onClose={() => setHistoryStudent(null)} />
      )}
    </div>
  );
}

export default Dues;
