const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.vercel.app/api' 
  : '/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Students API
  async getStudents() {
    return this.request('/students');
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
    return this.request('/payments');
  }

  async createPayment(payment: any) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async updatePayment(id: string, payment: any) {
    return this.request(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payment),
    });
  }

  // Seats API
  async getSeats() {
    return this.request('/seats');
  }

  // WhatsApp API
  async sendWhatsAppMessage(mobile: string, message: string, type = 'welcome') {
    return this.request('/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify({ mobile, message, type }),
    });
  }

  async sendPaymentReminder(mobile: string, name: string, amount: number, dueDate: string) {
    const message = `Dear ${name}, your payment of $${amount} is due on ${dueDate}. Please make the payment to continue using our library services.`;
    return this.sendWhatsAppMessage(mobile, message, 'reminder');
  }
}

export const apiService = new ApiService();