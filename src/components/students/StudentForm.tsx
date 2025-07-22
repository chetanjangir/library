import React, { useState } from 'react';
import Button from '../ui/Button';
import type { Student } from '../../types';

interface StudentFormProps {
  onSubmit: (student: Omit<Student, 'id'>) => void;
  onCancel: () => void;
  editingStudent?: Student | null;
  prefilledSeatNumber?: number;
}

function StudentForm({ onSubmit, onCancel, editingStudent, prefilledSeatNumber }: StudentFormProps) {
  const [formData, setFormData] = useState({
    name: editingStudent?.name || '',
    email: editingStudent?.email || '',
    mobile: editingStudent?.mobile || '',
    startDate: editingStudent?.startDate ? new Date(editingStudent.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: editingStudent?.endDate ? new Date(editingStudent.endDate).toISOString().split('T')[0] : '',
    planType: editingStudent?.planType || 'monthly',
    dayType: editingStudent?.dayType || 'full',
    halfDaySlot: editingStudent?.halfDaySlot || 'morning',
    status: editingStudent?.status || 'active',
    currency: editingStudent?.currency || 'USD',
    monthlyAmount: editingStudent?.monthlyAmount || 100,
    halfDayAmount: editingStudent?.halfDayAmount || 60,
    fullDayAmount: editingStudent?.fullDayAmount || 100,
    seatNumber: editingStudent?.seatNumber || prefilledSeatNumber || undefined,
    paymentStatus: editingStudent?.paymentStatus || 'due',
    paidAmount: editingStudent?.paidAmount || 0,
    balanceAmount: editingStudent?.balanceAmount || 0
  });

  // Calculate total amount based on day type
  const totalAmount = formData.dayType === 'half' ? formData.halfDayAmount : formData.fullDayAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use provided end date or calculate based on plan type
    let subscriptionEndDate;
    if (formData.endDate) {
      subscriptionEndDate = new Date(formData.endDate);
    } else {
      subscriptionEndDate = new Date(formData.startDate);
      if (formData.planType === 'monthly') {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      } else if (formData.planType === 'yearly') {
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
      } else {
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 1);
      }
    }

    onSubmit({
      ...formData,
      joinDate: formData.startDate,
      startDate: formData.startDate,
      endDate: formData.endDate || subscriptionEndDate.toISOString(),
      subscriptionEndDate: subscriptionEndDate.toISOString(),
    });
  };

  // Calculate balance amount when paid amount changes
  const calculatedBalance = totalAmount - formData.paidAmount;

  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      balanceAmount: Math.max(0, calculatedBalance)
    }));
  }, [formData.paidAmount, formData.dayType, formData.halfDayAmount, formData.fullDayAmount, calculatedBalance]);

  const getCurrencySymbol = (currency: string) => {
    const symbols = { USD: '$', EUR: '€', INR: '₹', GBP: '£' };
    return symbols[currency as keyof typeof symbols] || currency;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input
            type="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
          <input
            type="tel"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date *</label>
          <input
            type="date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
          <p className="mt-1 text-sm text-gray-500">Leave empty to auto-calculate based on plan type</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Seat Number</label>
          <input
            type="number"
            min="1"
            max="100"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.seatNumber || ''}
            onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value ? parseInt(e.target.value) : undefined })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Plan Type</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.planType}
            onChange={(e) => setFormData({ ...formData, planType: e.target.value as Student['planType'] })}
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
            onChange={(e) => setFormData({ ...formData, dayType: e.target.value as 'full' | 'half' })}
          >
            <option value="full">Full Day</option>
            <option value="half">Half Day</option>
          </select>
        </div>

        {formData.dayType === 'half' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Half Day Slot</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              value={formData.halfDaySlot}
              onChange={(e) => setFormData({ ...formData, halfDaySlot: e.target.value as 'morning' | 'evening' })}
            >
              <option value="morning">Morning (9 AM - 2 PM)</option>
              <option value="evening">Evening (2 PM - 9 PM)</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value as Student['currency'] })}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="INR">INR (₹)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Monthly Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.monthlyAmount}
            onChange={(e) => setFormData({ ...formData, monthlyAmount: parseFloat(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Half Day Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.halfDayAmount}
            onChange={(e) => setFormData({ ...formData, halfDayAmount: parseFloat(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Full Day Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.fullDayAmount}
            onChange={(e) => setFormData({ ...formData, fullDayAmount: parseFloat(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Status</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.paymentStatus}
            onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as 'paid' | 'due' | 'partial' })}
          >
            <option value="due">Due</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{getCurrencySymbol(formData.currency)}</span>
            </div>
            <input
              type="number"
              min="0"
              max={totalAmount}
              step="0.01"
              className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.paidAmount}
              onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Balance Amount</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{getCurrencySymbol(formData.currency)}</span>
            </div>
            <input
              type="number"
              className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 sm:text-sm"
              value={formData.balanceAmount}
              readOnly
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">Auto-calculated: Total - Paid</p>
        </div>

        <div className="md:col-span-2">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Payment Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Total Amount:</span>
                <p className="font-medium">{getCurrencySymbol(formData.currency)}{totalAmount}</p>
              </div>
              <div>
                <span className="text-blue-600">Paid Amount:</span>
                <p className="font-medium">{getCurrencySymbol(formData.currency)}{formData.paidAmount}</p>
              </div>
              <div>
                <span className="text-blue-600">Balance:</span>
                <p className="font-medium">{getCurrencySymbol(formData.currency)}{formData.balanceAmount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{editingStudent ? 'Update' : 'Add'} Student</Button>
      </div>
    </form>
  );
}

export default StudentForm;