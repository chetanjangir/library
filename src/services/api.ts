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
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(student),
    });
  }

  async deleteStudent(id: string) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
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
      // Simulate WhatsApp message sending
      console.log('WhatsApp message:', { mobile, message, type });
      return { success: true, message: 'WhatsApp message sent (simulated)' };
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      // Don't throw error for WhatsApp failures
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendPaymentReminder(mobile: string, name: string, amount: number, dueDate: string) {
    const message = `Dear ${name}, your payment of $${amount} is due on ${dueDate}. Please make the payment to continue using our library services.`;
    return this.sendWhatsAppMessage(mobile, message, 'reminder');
  }
}

export const apiService = new ApiService();