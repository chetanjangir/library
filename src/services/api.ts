const API_URL = '/api';

interface StudentsPageParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  seatFilter?: string;
  paymentStatus?: string;
  expiryDays?: number | null;
  addedWithin?: string;
}

interface StudentsPageResult {
  students: any[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  expiringSoonCount: number;
}

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    
    console.log('Making API request to:', url, options.method || 'GET');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('API error data:', errorData);
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      return data;
    } catch (error) {
      console.error('API Request failed for', url, ':', error);
      throw error;
    }
  }

  // Students API
  async getStudents() {
    try {
      return await this.request('/students');
    } catch (error) {
      console.error('Failed to fetch students:', error);
      // Return empty array as fallback
      return [];
    }
  }

  async createStudent(student: any) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
  }

  async updateStudent(id: string, student: any) {
    return this.request('/students', {
      method: 'PUT',
      body: JSON.stringify({ id, ...student }),
    });
  }

  async deleteStudent(id: string) {
    return this.request('/students', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  async getStudentsPaged(params: StudentsPageParams): Promise<StudentsPageResult> {
    const fallback: StudentsPageResult = {
      students: [],
      pagination: { page: params.page || 1, limit: params.limit || 20, total: 0, totalPages: 1 },
      expiringSoonCount: 0
    };

    try {
      const qs = new URLSearchParams();
      qs.set('page', String(params.page || 1));
      qs.set('limit', String(params.limit || 20));
      if (params.search) qs.set('search', params.search);
      if (params.status && params.status !== 'all') qs.set('status', params.status);
      if (params.seatFilter && params.seatFilter !== 'all') qs.set('seatFilter', params.seatFilter);
      if (params.paymentStatus && params.paymentStatus !== 'all') qs.set('paymentStatus', params.paymentStatus);
      if (params.expiryDays) qs.set('expiryDays', String(params.expiryDays));
      if (params.addedWithin && params.addedWithin !== 'all') qs.set('addedWithin', params.addedWithin);

      const result = await this.request(`/students?${qs.toString()}`);
      if (!result || !Array.isArray(result.students)) {
        return fallback;
      }
      return result;
    } catch (error) {
      console.error('Failed to fetch paginated students:', error);
      return fallback;
    }
  }


  // Payments API
  async getPayments() {
    try {
      return await this.request('/payments');
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      return [];
    }
  }

  async createPayment(payment: any) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async updatePayment(id: string, updates: any) {
    return this.request('/payments', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
  }

  async deletePayment(id: string) {
    const result = await this.request('/payments', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
    return result;
  }

  // Seats API
  async getSeats() {
    try {
      return await this.request('/seats');
    } catch (error) {
      console.error('Failed to fetch seats:', error);
      // Return 100 vacant seats as fallback
      const fallbackSeats = [];
      for (let i = 1; i <= 120; i++) {
        fallbackSeats.push({
          id: i,
          seatNumber: i,
          isOccupied: false,
          type: 'vacant'
        });
      }
      return fallbackSeats;
    }
  }

  async getAvailableSeats() {
    try {
      return await this.request('/seats-availability');
    } catch (error) {
      console.error('Failed to fetch available seats:', error);
      // Return all seats as available fallback
      const fallbackSeats = [];
      for (let i = 1; i <= 100; i++) {
        fallbackSeats.push({
          seatNumber: i,
          type: 'vacant',
          availability: 'full'
        });
      }
      return fallbackSeats;
    }
  }

  // WhatsApp API
  async sendWhatsAppMessage(mobile: string, message: string, type = 'welcome') {
    try {
      // Use our API endpoint for WhatsApp messages
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: type,
          mobile: mobile,
          studentName: 'Student', // This should be passed as parameter
          message: message
        })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: result.success, message: result.message || 'WhatsApp message sent' };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Failed to send WhatsApp message' };
      }
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendPaymentReminder(mobile: string, name: string, amount: number, dueDate: string) {
    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'reminder',
          mobile: mobile,
          studentName: name,
          amount: amount,
          currency: 'INR',
          dueDate: dueDate
        })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: result.success, message: result.message || 'Payment reminder sent' };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Failed to send payment reminder' };
      }
    } catch (error) {
      console.error('Failed to send payment reminder:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Settings API
  async getSettings() {
    try {
      return await this.request('/settings');
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      return null;
    }
  }

  async updateSettings(settings: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const apiService = new ApiService();