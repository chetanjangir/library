import React, { useState } from 'react';
import Button from '../ui/Button';
import { apiService } from '../../services/api';
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
    fatherName: editingStudent?.fatherName || '',
    mobile: editingStudent?.mobile || '',
    email: editingStudent?.email || '',
    biometricId: editingStudent?.biometricId || '',
    aadhaarNumber: editingStudent?.aadhaarNumber || '',
    address: editingStudent?.address || '',
    startDate: editingStudent?.startDate ? new Date(editingStudent.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: editingStudent?.endDate ? new Date(editingStudent.endDate).toISOString().split('T')[0] : '',
    seatNumber: editingStudent?.seatNumber || prefilledSeatNumber || undefined,
    planType: editingStudent?.planType || 'monthly',
    dayType: editingStudent?.dayType || 'full',
    halfDaySlot: editingStudent?.halfDaySlot || 'morning',
    currency: editingStudent?.currency || 'INR',
    monthlyAmount: editingStudent?.monthlyAmount || 1000,
    paymentStatus: editingStudent?.paymentStatus || 'due',
    paidAmount: editingStudent?.paidAmount || 0,
    balanceAmount: editingStudent?.balanceAmount || 0,
    status: editingStudent?.status || 'active'
  });

  const [availableSeats, setAvailableSeats] = useState<any[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Load settings and available seats when component mounts
  React.useEffect(() => {
    loadSettings();
    loadAvailableSeats();
  }, []);

  // Reload available seats when day type or slot changes
  React.useEffect(() => {
    loadAvailableSeats();
  }, [formData.dayType, formData.halfDaySlot]);

  // Update monthly amount when settings change or day type changes
  React.useEffect(() => {
    if (settings && !editingStudent) {
      const defaultAmount = formData.dayType === 'half' 
        ? settings.fees?.halfDayFee || 600
        : settings.fees?.fullDayFee || 1000;
      
      setFormData(prev => ({
        ...prev,
        monthlyAmount: defaultAmount,
        currency: settings.fees?.currency || 'INR'
      }));
    }
  }, [settings, formData.dayType, editingStudent]);

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const settingsData = await apiService.getSettings();
      setSettings(settingsData);
      
      // Set default values from settings if not editing
      if (!editingStudent && settingsData) {
        const defaultAmount = formData.dayType === 'half' 
          ? settingsData.fees?.halfDayFee || 600
          : settingsData.fees?.fullDayFee || 1000;
        
        setFormData(prev => ({
          ...prev,
          monthlyAmount: defaultAmount,
          currency: settingsData.fees?.currency || 'INR'
        }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const loadAvailableSeats = async () => {
    try {
      setLoadingSeats(true);
      const seats = await apiService.getAvailableSeats();
      
      // Filter seats based on day type and slot
      let filteredSeats = seats;
      if (formData.dayType === 'half') {
        filteredSeats = seats.filter(seat => 
          seat.availability === 'full' || 
          seat.availability === formData.halfDaySlot
        );
      } else {
        filteredSeats = seats.filter(seat => seat.availability === 'full');
      }
      
      setAvailableSeats(filteredSeats);
    } catch (error) {
      console.error('Failed to load available seats:', error);
      setAvailableSeats([]);
    } finally {
      setLoadingSeats(false);
    }
  };

  // Calculate balance amount when paid amount or monthly amount changes
  const calculatedBalance = Math.max(0, formData.monthlyAmount - formData.paidAmount);

  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      balanceAmount: calculatedBalance
    }));
  }, [formData.paidAmount, formData.monthlyAmount, calculatedBalance]);

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

    // Calculate half day and full day amounts based on monthly amount
    const halfDayAmount = formData.monthlyAmount * 0.6;
    const fullDayAmount = formData.monthlyAmount;

    onSubmit({
      ...formData,
      joinDate: formData.startDate,
      subscriptionEndDate: subscriptionEndDate.toISOString(),
      halfDayAmount,
      fullDayAmount,
    });
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols = { USD: '$', EUR: '€', INR: '₹', GBP: '£' };
    return symbols[currency as keyof typeof symbols] || currency;
  };

  if (loadingSettings) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-lg">Loading form settings...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Row 1: Student Name, Father's Name, Mobile Number */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Student Name *</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Father's Name</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.fatherName}
            onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
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
      </div>

      {/* Row 2: Email, Biometric ID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium text-gray-700">Biometric ID</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.biometricId}
            onChange={(e) => setFormData({ ...formData, biometricId: e.target.value })}
            placeholder="Enter biometric ID"
          />
        </div>
      </div>

      {/* Row 3: Aadhaar Card Number, Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Aadhaar Card Number</label>
          <input
            type="text"
            maxLength="12"
            pattern="[0-9]{12}"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.aadhaarNumber}
            onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
            placeholder="Enter 12-digit Aadhaar number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Enter complete address"
          />
        </div>
      </div>

      {/* Row 4: Start Date, End Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      {/* Row 5: Seat Number, Plan Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Seat Number</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.seatNumber || ''}
            onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value ? parseInt(e.target.value) : undefined })}
          >
            <option value="">Select available seat</option>
            {/* Show current seat if editing */}
            {editingStudent && editingStudent.seatNumber && !availableSeats.find(s => s.seatNumber === editingStudent.seatNumber) && (
              <option value={editingStudent.seatNumber}>
                Seat {editingStudent.seatNumber} (Current)
              </option>
            )}
            {loadingSeats ? (
              <option disabled>Loading available seats...</option>
            ) : (
              availableSeats.map((seat) => (
                <option key={seat.seatNumber} value={seat.seatNumber}>
                  Seat {seat.seatNumber} 
                  {seat.availability !== 'full' ? ` (${seat.availability} slot available)` : ' (fully available)'}
                </option>
              ))
            )}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {formData.dayType === 'half' 
              ? `Showing seats available for ${formData.halfDaySlot} slot`
              : 'Showing fully available seats'
            }
          </p>
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
      </div>

      {/* Row 6: Day Type, Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          {formData.dayType === 'half' && (
            <select
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              value={formData.halfDaySlot}
              onChange={(e) => setFormData({ ...formData, halfDaySlot: e.target.value as 'morning' | 'evening' })}
            >
              <option value="morning">Morning (9 AM - 2 PM)</option>
              <option value="evening">Evening (2 PM - 9 PM)</option>
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value as Student['currency'] })}
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      {/* Row 7: Monthly Amount, Payment Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Monthly Amount *</label>
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
              value={formData.monthlyAmount}
              onChange={(e) => setFormData({ ...formData, monthlyAmount: parseFloat(e.target.value) || 0 })}
            />
          </div>
          {settings && (
            <p className="mt-1 text-sm text-gray-500">
              Default: {getCurrencySymbol(formData.currency)}
              {formData.dayType === 'half' 
                ? settings.fees?.halfDayFee || 600
                : settings.fees?.fullDayFee || 1000
              } (from settings)
            </p>
          )}
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
      </div>

      {/* Row 8: Paid Amount, Balance Amount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{getCurrencySymbol(formData.currency)}</span>
            </div>
            <input
              type="number"
              min="0"
              max={formData.monthlyAmount}
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
          <p className="mt-1 text-sm text-gray-500">Auto-calculated: Monthly Amount - Paid Amount</p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Payment Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-600">Monthly Amount:</span>
            <p className="font-medium">{getCurrencySymbol(formData.currency)}{formData.monthlyAmount}</p>
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

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{editingStudent ? 'Update' : 'Add'} Student</Button>
      </div>
    </form>
  );
}

export default StudentForm;