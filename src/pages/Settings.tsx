import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Building, DollarSign, Bell, MessageCircle, Mail, Smartphone, Save } from 'lucide-react';
import Button from '../components/ui/Button';
import { apiService } from '../services/api';

interface LibrarySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

interface FeeStructure {
  monthlyFee: number;
  halfDayFee: number;
  fullDayFee: number;
  currency: 'USD' | 'EUR' | 'INR' | 'GBP';
  warningDays: number;
}

interface NotificationSettings {
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  autoWelcomeEnabled: boolean;
  autoReminderEnabled: boolean;
  reminderDaysBefore: number;
  whatsappUsername: string;
  whatsappSecret: string;
  whatsappSenderNumber: string;
  whatsappCustomerId: string;
  whatsappWabaId: string;
  whatsappSubAccountId: string;
  whatsappBasicUrl: string;
  whatsappContentUrl: string;
  whatsappWelcomeTemplateId: string;
  whatsappReminderTemplateId: string;
  emailApiKey: string;
  smsApiKey: string;
}

interface WifiDetails {
  ssid: string;
  password: string;
}

function Settings() {
  const [activeTab, setActiveTab] = useState<'library' | 'fees' | 'notifications'>('library');
  const [librarySettings, setLibrarySettings] = useState<LibrarySettings>({
    name: 'Central Library',
    address: '123 Main Street, City, State 12345',
    phone: '+91 98765 43210',
    email: 'info@centrallibrary.com',
    website: 'www.centrallibrary.com'
  });

  const [feeStructure, setFeeStructure] = useState<FeeStructure>({
    monthlyFee: 1000,
    halfDayFee: 600,
    fullDayFee: 1000,
    currency: 'INR',
    warningDays: 7
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    whatsappEnabled: true,
    emailEnabled: false,
    smsEnabled: false,
    autoWelcomeEnabled: true,
    autoReminderEnabled: true,
    reminderDaysBefore: 7,
    whatsappUsername: '',
    whatsappSecret: '',
    whatsappSenderNumber: '919315431037',
    whatsappCustomerId: 'SALEASSIST_SKzeozJyiA96VM09HL4h',
    whatsappWabaId: '105382835942086',
    whatsappSubAccountId: 'd6ddb224-251b-4d50-9891-f6140aa5141b',
    whatsappBasicUrl: 'https://iqwhatsapp.airtel.in:443/gateway/airtel-xchange/basic/whatsapp-manager/v1',
    whatsappContentUrl: 'https://iqwhatsapp.airtel.in:443/gateway/airtel-xchange/whatsapp-content-manager/v1',
    whatsappWelcomeTemplateId: '01k0scq4rbqeh6ch1jp4j33gd8',
    whatsappReminderTemplateId: 'payment_reminder_template',
    emailApiKey: '',
    smsApiKey: ''
  });

  const [wifiDetails, setWifiDetails] = useState<WifiDetails>({
    ssid: 'LibraryWiFi',
    password: 'library123'
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings from MongoDB on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await apiService.getSettings();
      
      if (settings) {
        if (settings.library) {
          setLibrarySettings(settings.library);
        }
        if (settings.fees) {
          setFeeStructure(settings.fees);
        }
        if (settings.notifications) {
          setNotificationSettings(settings.notifications);
        }
        if (settings.wifiDetails) {
          setWifiDetails(settings.wifiDetails);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleSaveLibrarySettings = async () => {
    setSaving(true);
    try {
      await apiService.updateSettings({
        type: 'app_settings',
        library: librarySettings,
        fees: feeStructure,
        notifications: notificationSettings,
        wifiDetails: wifiDetails
      });
      alert('Library settings saved successfully!');
    } catch (error) {
      alert('Failed to save library settings');
      console.error('Error saving library settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFeeStructure = async () => {
    setSaving(true);
    try {
      await apiService.updateSettings({
        type: 'app_settings',
        library: librarySettings,
        fees: feeStructure,
        notifications: notificationSettings,
        wifiDetails: wifiDetails
      });
      alert('Fee structure saved successfully!');
    } catch (error) {
      alert('Failed to save fee structure');
      console.error('Error saving fee structure:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setSaving(true);
    try {
      await apiService.updateSettings({
        type: 'app_settings',
        library: librarySettings,
        fees: feeStructure,
        notifications: notificationSettings,
        wifiDetails: wifiDetails
      });
      
      // Refresh WhatsApp service configuration
      const { whatsappService } = await import('../services/whatsappService');
      await whatsappService.refreshSettings();
      
      alert('Notification settings saved successfully!');
    } catch (error) {
      alert('Failed to save notification settings');
      console.error('Error saving notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'library', label: 'Library Details', icon: Building },
    { id: 'fees', label: 'Fee Structure', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const getCurrencySymbol = (currency: string) => {
    const symbols = { USD: '$', EUR: '€', INR: '₹', GBP: '£' };
    return symbols[currency as keyof typeof symbols] || currency;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="w-8 h-8 mr-3 text-indigo-600" />
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Configure your library management system</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'library' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Library Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Library Name *</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    value={librarySettings.name}
                    onChange={(e) => setLibrarySettings({ ...librarySettings, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    value={librarySettings.phone}
                    onChange={(e) => setLibrarySettings({ ...librarySettings, phone: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    value={librarySettings.address}
                    onChange={(e) => setLibrarySettings({ ...librarySettings, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    value={librarySettings.email}
                    onChange={(e) => setLibrarySettings({ ...librarySettings, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    type="url"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    value={librarySettings.website}
                    onChange={(e) => setLibrarySettings({ ...librarySettings, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveLibrarySettings} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Library Settings'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Default Fee Structure</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    value={feeStructure.currency}
                    onChange={(e) => setFeeStructure({ ...feeStructure, currency: e.target.value as any })}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Warning Days</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    value={feeStructure.warningDays}
                    onChange={(e) => setFeeStructure({ ...feeStructure, warningDays: parseInt(e.target.value) })}
                  />
                  <p className="mt-1 text-sm text-gray-500">Days before expiry to show warnings</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Monthly Fee</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{getCurrencySymbol(feeStructure.currency)}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={feeStructure.monthlyFee}
                      onChange={(e) => setFeeStructure({ ...feeStructure, monthlyFee: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Half Day Fee</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{getCurrencySymbol(feeStructure.currency)}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={feeStructure.halfDayFee}
                      onChange={(e) => setFeeStructure({ ...feeStructure, halfDayFee: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Day Fee</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{getCurrencySymbol(feeStructure.currency)}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={feeStructure.fullDayFee}
                      onChange={(e) => setFeeStructure({ ...feeStructure, fullDayFee: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveFeeStructure} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Fee Structure'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
              
              {/* WhatsApp Settings */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="text-lg font-medium text-green-900">WhatsApp Notifications</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.whatsappEnabled}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, whatsappEnabled: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                {notificationSettings.whatsappEnabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">WhatsApp Username</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
                        value={notificationSettings.whatsappUsername}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, whatsappUsername: e.target.value })}
                        placeholder="Your Airtel WhatsApp username"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">WhatsApp Secret</label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
                        value={notificationSettings.whatsappSecret}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, whatsappSecret: e.target.value })}
                        placeholder="Your Airtel WhatsApp secret"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sender Number</label>
                      <input
                        type="tel"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
                        value={notificationSettings.whatsappSenderNumber}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, whatsappSenderNumber: e.target.value })}
                        placeholder="919315431037"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Welcome Template ID</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
                        value={notificationSettings.whatsappWelcomeTemplateId}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, whatsappWelcomeTemplateId: e.target.value })}
                        placeholder="01k0scq4rbqeh6ch1jp4j33gd8"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reminder Template ID</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
                        value={notificationSettings.whatsappReminderTemplateId}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, whatsappReminderTemplateId: e.target.value })}
                        placeholder="payment_reminder_template"
                      />
                    </div>

                    <div className="border-t pt-4">
                      <h5 className="font-medium text-gray-900 mb-3">Auto Notifications</h5>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Auto Welcome Message</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={notificationSettings.autoWelcomeEnabled}
                              onChange={(e) => setNotificationSettings({ ...notificationSettings, autoWelcomeEnabled: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Auto Payment Reminders</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={notificationSettings.autoReminderEnabled}
                              onChange={(e) => setNotificationSettings({ ...notificationSettings, autoReminderEnabled: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Reminder Days Before Due</label>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
                            value={notificationSettings.reminderDaysBefore}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, reminderDaysBefore: parseInt(e.target.value) })}
                          />
                        </div>

                        <div className="border-t pt-4">
                          <h6 className="font-medium text-gray-900 mb-3">WiFi Details (for welcome messages)</h6>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">WiFi SSID</label>
                              <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
                                value={wifiDetails.ssid}
                                onChange={(e) => setWifiDetails({ ...wifiDetails, ssid: e.target.value })}
                                placeholder="LibraryWiFi"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">WiFi Password</label>
                              <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
                                value={wifiDetails.password}
                                onChange={(e) => setWifiDetails({ ...wifiDetails, password: e.target.value })}
                                placeholder="library123"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Email Settings */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="text-lg font-medium text-blue-900">Email Notifications</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.emailEnabled}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, emailEnabled: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                {notificationSettings.emailEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email API Key</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                      value={notificationSettings.emailApiKey}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, emailApiKey: e.target.value })}
                      placeholder="Your email service API key"
                    />
                  </div>
                )}
              </div>

              {/* SMS Settings */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Smartphone className="w-5 h-5 text-purple-600 mr-2" />
                    <h4 className="text-lg font-medium text-purple-900">SMS Notifications</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.smsEnabled}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, smsEnabled: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                {notificationSettings.smsEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SMS API Key</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm px-3 py-2 border"
                      value={notificationSettings.smsApiKey}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, smsApiKey: e.target.value })}
                      placeholder="Your SMS service API key"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotificationSettings} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Notification Settings'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;