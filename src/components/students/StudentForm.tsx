import { useState } from 'react';
import Button from '../ui/Button';
import type { Student } from '../../types';

interface StudentFormProps {
  onSubmit: (student: Omit<Student, 'id'>) => void;
  onCancel: () => void;
  editingStudent?: Student | null;
}

function StudentForm({ onSubmit, onCancel, editingStudent }: StudentFormProps) {
  const [formData, setFormData] = useState({
    name: editingStudent?.name || '',
    email: editingStudent?.email || '',
    mobile: editingStudent?.mobile || '',
    planType: editingStudent?.planType || 'monthly',
    dayType: editingStudent?.dayType || 'full',
    halfDaySlot: editingStudent?.halfDaySlot || 'morning',
    status: editingStudent?.status || 'active',
    currency: editingStudent?.currency || 'USD',
    monthlyAmount: editingStudent?.monthlyAmount || 100,
    halfDayAmount: editingStudent?.halfDayAmount || 60,
    fullDayAmount: editingStudent?.fullDayAmount || 100,
    seatNumber: editingStudent?.seatNumber || undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subscriptionEndDate = new Date();
    if (formData.planType === 'monthly') {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    } else if (formData.planType === 'yearly') {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    } else {
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 1);
    }

    onSubmit({
      ...formData,
      joinDate: editingStudent?.joinDate || new Date().toISOString(),
      subscriptionEndDate: subscriptionEndDate.toISOString(),
    });
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
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{editingStudent ? 'Update' : 'Add'} Student</Button>
      </div>
    </form>
  );
}

export default StudentForm;