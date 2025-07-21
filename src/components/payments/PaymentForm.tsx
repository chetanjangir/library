import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import type { Payment, Student } from '../../types';

interface PaymentFormProps {
  students: Student[];
  onSubmit: (payment: Omit<Payment, 'id'>) => void;
  onCancel: () => void;
  editingPayment?: Payment | null;
}

function PaymentForm({ students, onSubmit, onCancel, editingPayment }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    studentId: editingPayment?.studentId || '',
    amount: editingPayment?.amount || 0,
    currency: editingPayment?.currency || 'USD' as const,
    dueDate: editingPayment?.dueDate ? new Date(editingPayment.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    planType: editingPayment?.planType || 'monthly' as const,
    dayType: editingPayment?.dayType || 'full' as const,
    status: editingPayment?.status || 'pending' as const,
    paidDate: editingPayment?.paidDate ? new Date(editingPayment.paidDate).toISOString().split('T')[0] : '',
  });

  const selectedStudent = students.find(s => s.id === formData.studentId);

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData({
        ...formData,
        studentId,
        currency: student.currency,
        planType: student.planType,
        dayType: student.dayType,
        amount: student.dayType === 'half' ? student.halfDayAmount : student.fullDayAmount,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const paymentData = {
      studentId: formData.studentId,
      amount: formData.amount,
      currency: formData.currency,
      dueDate: formData.dueDate,
      planType: formData.planType,
      dayType: formData.dayType,
      status: formData.status,
      studentName: selectedStudent.name,
      paidDate: formData.status === 'paid' && formData.paidDate ? formData.paidDate : undefined,
    };

    onSubmit(paymentData);
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols = { USD: '$', EUR: '€', INR: '₹', GBP: '£' };
    return symbols[currency as keyof typeof symbols] || currency;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Student *</label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.studentId}
            onChange={(e) => handleStudentChange(e.target.value)}
          >
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} - Seat {student.seatNumber || 'N/A'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date *</label>
          <input
            type="date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Plan Type</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.planType}
            onChange={(e) => setFormData({ ...formData, planType: e.target.value as Payment['planType'] })}
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Day Type</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.dayType}
            onChange={(e) => setFormData({ ...formData, dayType: e.target.value as Payment['dayType'] })}
          >
            <option value="full">Full Day</option>
            <option value="half">Half Day</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value as Payment['currency'] })}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="INR">INR (₹)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount *</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{getCurrencySymbol(formData.currency)}</span>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Status</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Payment['status'] })}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {formData.status === 'paid' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Paid Date</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              value={formData.paidDate}
              onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
            />
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Student Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Name:</span> {selectedStudent.name}
            </div>
            <div>
              <span className="text-gray-500">Email:</span> {selectedStudent.email}
            </div>
            <div>
              <span className="text-gray-500">Mobile:</span> {selectedStudent.mobile}
            </div>
            <div>
              <span className="text-gray-500">Seat:</span> {selectedStudent.seatNumber || 'Not assigned'}
            </div>
            <div>
              <span className="text-gray-500">Plan:</span> {selectedStudent.planType} - {selectedStudent.dayType} day
            </div>
            <div>
              <span className="text-gray-500">Default Amount:</span> {getCurrencySymbol(selectedStudent.currency)}{selectedStudent.dayType === 'half' ? selectedStudent.halfDayAmount : selectedStudent.fullDayAmount}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{editingPayment ? 'Update' : 'Add'} Payment</Button>
      </div>
    </form>
  );
}

export default PaymentForm;