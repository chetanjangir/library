import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Building, DollarSign, Bell, MessageCircle, Mail, Smartphone, Save } from 'lucide-react';
import Button from '../components/ui/Button';

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
  whatsappApiUrl: string;
  whatsappToken: string;
  emailApiKey: string;
  smsApiKey: string;
}

function Settings() {
  const [activeTab, setActiveTab] = useState<'library' | 'fees' | 'notifications'>('library');
  const [librarySettings, setLibrarySettings] = useState<LibrarySettings>({
    name: 'Central Library',
    address: '123 Main Street, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@centrallibrary.com',
    website: 'www.centrallibrary.com'
  });

  const [feeStructure, setFeeStructure] = useState<FeeStructure>({
    monthlyFee: 100,
    halfDayFee: 60,
    fullDayFee: 100,
    currency: 'USD',
    warningDays: 7
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    whatsappEnabled: true,
    emailEnabled: false,
    smsEnabled: false,
    whatsappApiUrl: 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages',
    whatsappToken: 'your_permanent_access_token_here',
    emailApiKey: '',
    smsApiKey: ''
  });

  const [saving, setSaving] = useState(false);

  const handleSaveLibrarySettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage for now (in real app, save to database)
      localStorage.setItem('librarySettings', JSON.stringify(librarySettings));
      alert('Library settings saved successfully!');
    } catch (error) {
      alert('Failed to save library settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFeeStructure = async () => {
    setSaving(true);
    try {
      localStorage.setItem('feeStructure', JSON.stringify(feeStructure));
      alert('Fee structure saved successfully!');
    } catch (error) {
      alert('Failed to save fee structure');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setSaving(true);
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      alert('Notification settings saved successfully!');
    } catch (error) {
      alert('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedLibrarySettings = localStorage.getItem('librarySettings');
    const savedFeeStructure = localStorage.getItem('feeStructure');
    const savedNotificationSettings = localStorage.getItem('notificationSettings');

    if (savedLibrarySettings) {
      setLibrarySettings(JSON.parse(savedLibrarySettings));
    }
    if (savedFeeStructure) {
      setFeeStructure(JSON.parse(savedFeeStructure));
    }
    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings));
    }
  }, []);

  const tabs = [
    { id: 'library', label: 'Library Details', icon: Building },
    { id: 'fees', label: 'Fee Structure', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const getCurrencySymbol = (currency: string) => {
    const symbols = { USD: '$', EUR: '€', INR: '₹', GBP: '£' };
    return symbols[currency as keyof typeof symbols] || currency;
  };

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
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
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
                      <label className="block text-sm font-medium text-gray-700">WhatsApp API URL</label>
                      <input
                        type="url"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
                        value={notificationSettings.whatsappApiUrl}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, whatsappApiUrl: e.target.value })}
                        placeholder="https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">WhatsApp Access Token</label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
                        value={notificationSettings.whatsappToken}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, whatsappToken: e.target.value })}
                        placeholder="Your permanent access token"
                      />
                    </div>

                    <div className="bg-green-100 p-3 rounded-md">
                      <h5 className="font-medium text-green-900 mb-2">Sample cURL Command:</h5>
                      <code className="text-xs text-green-800 bg-green-200 p-2 rounded block overflow-x-auto">
                        {`curl -X POST "${notificationSettings.whatsappApiUrl}" \\
  -H "Authorization: Bearer ${notificationSettings.whatsappToken}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messaging_product": "whatsapp",
    "to": "PHONE_NUMBER",
    "type": "text",
    "text": {
      "body": "Your subscription expires soon. Please renew."
    }
  }'`}
                      </code>
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