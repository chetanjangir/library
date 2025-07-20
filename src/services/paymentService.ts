import { supabase } from '../lib/supabase';
import type { Payment } from '../types';

export const paymentService = {
  async getAllPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        students (
          name
        )
      `)
      .order('due_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updatePaymentStatus(id: string, status: 'paid' | 'pending' | 'overdue', paidDate?: string): Promise<Payment> {
    const updates: any = { status };
    if (paidDate) updates.paid_date = paidDate;
    
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPaymentsByStudent(studentId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .order('due_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};