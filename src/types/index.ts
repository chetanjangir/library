export interface Student {
  id: string;
  name: string;
  email: string;
  mobile: string;
  joinDate: string;
  planType: 'daily' | 'monthly' | 'yearly';
  dayType: 'full' | 'half';
  halfDaySlot?: 'morning' | 'evening';
  status: 'active' | 'inactive' | 'expired';
  seatNumber?: number;
  subscriptionEndDate: string;
  currency: 'USD' | 'EUR' | 'INR' | 'GBP';
  monthlyAmount: number;
  halfDayAmount: number;
  fullDayAmount: number;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'INR' | 'GBP';
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  planType: 'daily' | 'monthly' | 'yearly';
  dayType: 'full' | 'half';
}

export interface Seat {
  id: number;
  isOccupied: boolean;
  student?: Student;
  halfDayStudents?: {
    morning?: Student;
    evening?: Student;
  };
  type: 'full' | 'half-shared' | 'vacant';
}

export interface Statistic {
  label: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down';
}

export interface NotificationSettings {
  whatsappEnabled: boolean;
  reminderDays: number;
  wifiDetails: {
    ssid: string;
    password: string;
  };
}