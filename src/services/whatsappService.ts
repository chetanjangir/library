interface WhatsAppTemplate {
  templateId: string;
  templateBody: string;
  variables: string[];
}

interface WhatsAppConfig {
  username: string;
  secret: string;
  customerId: string;
  wabaId: string;
  subAccountId: string;
  basicUrl: string;
  contentUrl: string;
  senderNumber: string;
  welcomeTemplateId: string;
  reminderTemplateId: string;
}

interface WhatsAppPayload {
  from: string;
  to: string;
  body: string;
  templateId: string;
  message: {
    variables: string[];
  };
}

class WhatsAppService {
  private config: WhatsAppConfig;
  private isEnabled: boolean = false;
  private settings: any = null;

  constructor() {
    // Default config with environment variables
    this.config = {
      username: '',
      secret: '',
      customerId: 'SALEASSIST_SKzeozJyiA96VM09HL4h',
      wabaId: '105382835942086',
      subAccountId: 'd6ddb224-251b-4d50-9891-f6140aa5141b',
      basicUrl: 'https://iqwhatsapp.airtel.in:443/gateway/airtel-xchange/basic/whatsapp-manager/v1',
      contentUrl: 'https://iqwhatsapp.airtel.in:443/gateway/airtel-xchange/whatsapp-content-manager/v1',
      senderNumber: '919315431037',
      welcomeTemplateId: '01k0scq4rbqeh6ch1jp4j33gd8',
      reminderTemplateId: 'payment_reminder_template'
    };
    
    this.loadSettings();
  }

  private async loadSettings() {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        this.settings = await response.json();
        if (this.settings?.notifications) {
          const notif = this.settings.notifications;
          this.config = {
            username: notif.whatsappUsername || '',
            secret: notif.whatsappSecret || '',
            customerId: notif.whatsappCustomerId || this.config.customerId,
            wabaId: notif.whatsappWabaId || this.config.wabaId,
            subAccountId: notif.whatsappSubAccountId || this.config.subAccountId,
            basicUrl: notif.whatsappBasicUrl || this.config.basicUrl,
            contentUrl: notif.whatsappContentUrl || this.config.contentUrl,
            senderNumber: notif.whatsappSenderNumber || this.config.senderNumber,
            welcomeTemplateId: notif.whatsappWelcomeTemplateId || this.config.welcomeTemplateId,
            reminderTemplateId: notif.whatsappReminderTemplateId || this.config.reminderTemplateId
          };
          this.isEnabled = notif.whatsappEnabled || false;
        }
      }
    } catch (error) {
      console.error('Failed to load WhatsApp settings:', error);
    }
  }

  private getAuthHeaders() {
    const credentials = `${this.config.username}:${this.config.secret}`;
    const encoded = btoa(credentials);
    return {
      'Authorization': `basic ${encoded}`,
      'Content-Type': 'application/json'
    };
  }

  private formatMobileNumber(mobile: string): string {
    // Remove any non-digit characters
    let cleaned = mobile.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned; // India country code
    }
    
    return cleaned;
  }

  private replaceVariables(template: string, variables: string[]): string {
    let result = template;
    variables.forEach((variable, index) => {
      result = result.replace(`{{${index + 1}}}`, variable);
    });
    return result;
  }

  async sendWelcomeMessage(studentName: string, mobile: string, seatNumber?: number, wifiSSID?: string, wifiPassword?: string): Promise<boolean> {
    if (!this.isEnabled || !this.config.username || !this.config.secret) {
      console.log('WhatsApp service not configured or disabled');
      return false;
    }

    // Check if auto welcome is enabled
    if (this.settings?.notifications?.autoWelcomeEnabled === false) {
      console.log('Auto welcome messages are disabled');
      return false;
    }

    const template: WhatsAppTemplate = {
      templateId: this.config.welcomeTemplateId,
      templateBody: 'Hi  {{1}} \n Welcome to Samarth Library! \n Your seat no is :  {{2}} \n Wifi name :  {{3}} \n Wifi password :  {{4}} \n Note: do not share seat and wifi details with anyone. Thanks',
      variables: [
        studentName,
        seatNumber ? `${seatNumber}` : 'TBD',
        wifiSSID || this.settings?.wifiDetails?.ssid || 'LibraryWiFi',
        wifiPassword || this.settings?.wifiDetails?.password || 'library123'
      ]
    };

    return this.sendTemplateMessage(mobile, template);
  }

  async sendPaymentReminder(studentName: string, mobile: string, amount: number, currency: string, dueDate: string): Promise<boolean> {
    if (!this.isEnabled || !this.config.username || !this.config.secret) {
      console.log('WhatsApp service not configured or disabled');
      return false;
    }

    const currencySymbol = this.getCurrencySymbol(currency);
    const template: WhatsAppTemplate = {
      templateId: this.config.reminderTemplateId,
      templateBody: 'Dear {{1}}, your payment of {{2}}{{3}} is due on {{4}}. Please make the payment to continue using our library services.',
      variables: [
        studentName,
        currencySymbol,
        amount.toString(),
        dueDate
      ]
    };

    return this.sendTemplateMessage(mobile, template);
  }

  private async sendTemplateMessage(mobile: string, template: WhatsAppTemplate): Promise<boolean> {
    try {
      // Use our API endpoint instead of direct Airtel API call
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: template.templateId === this.config.welcomeTemplateId ? 'welcome' : 'reminder',
          mobile: mobile,
          studentName: template.variables[0] || 'Student',
          amount: template.templateId === this.config.reminderTemplateId ? parseFloat(template.variables[2] || '0') : undefined,
          currency: 'INR',
          dueDate: template.variables[3] || new Date().toLocaleDateString(),
          seatNumber: template.variables[1] || undefined,
          wifiSSID: template.variables[2] || undefined,
          wifiPassword: template.variables[3] || undefined
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('WhatsApp message sent successfully:', result);
        return result.success;
      } else {
        const error = await response.json();
        console.error('WhatsApp message failed:', error);
        return false;
      }
    } catch (error) {
      console.error('WhatsApp service error:', error);
      return false;
    }
  }

  private getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'INR': '₹',
      'GBP': '£'
    };
    return symbols[currency] || currency;
  }

  updateConfig(config: Partial<WhatsAppConfig>) {
    this.config = { ...this.config, ...config };
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  async refreshSettings() {
    await this.loadSettings();
  }

  isConfigured(): boolean {
    return !!(this.config.username && this.config.secret);
  }
}

export const whatsappService = new WhatsAppService();