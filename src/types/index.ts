export interface Student {
  id: string;
  name: string;
  email: string;
  mobile: string;
  joinDate: string;
  startDate: string;
  endDate?: string;
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
  paymentStatus?: 'paid' | 'due' | 'partial';
  paidAmount?: number;
  balanceAmount?: number;
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  studentId?: string; // If role is student, links to student record
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}