const API_URL = '/api';

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
    return this.request(`/payments/${id}`, {
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
      for (let i = 1; i <= 100; i++) {
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