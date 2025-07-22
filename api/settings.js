import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Settings API called:', req.method, req.url);

  try {
    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      console.log('No MongoDB URI found, using fallback data');
      return handleFallback(req, res);
    }

    const client = await clientPromise;
    const db = client.db('library_management');
    const settingsCollection = db.collection('settings');

    if (req.method === 'GET') {
      console.log('Fetching settings from MongoDB...');
      
      // Get all settings
      const settings = await settingsCollection.findOne({ type: 'app_settings' });
      
      if (!settings) {
        // Create default settings if none exist
        const defaultSettings = {
          type: 'app_settings',
          library: {
            name: 'Central Library',
            address: '123 Main Street, City, State 12345',
            phone: '+91 98765 43210',
            email: 'info@centrallibrary.com',
            website: 'www.centrallibrary.com'
          },
          fees: {
            monthlyFee: 1000,
            halfDayFee: 600,
            fullDayFee: 1000,
            currency: 'INR',
            warningDays: 7
          },
          notifications: {
            whatsappEnabled: false,
            emailEnabled: false,
            smsEnabled: false,
            autoWelcomeEnabled: true,
            autoReminderEnabled: true,
            reminderDaysBefore: 7,
            whatsappUsername: process.env.WHATSAPP_USERNAME || '',
            whatsappSecret: process.env.WHATSAPP_SECRET || '',
            whatsappSenderNumber: process.env.WHATSAPP_SENDER_NUMBER || '919315431037',
            whatsappCustomerId: process.env.WHATSAPP_CUSTOMER_ID || 'SALEASSIST_SKzeozJyiA96VM09HL4h',
            whatsappWabaId: process.env.WHATSAPP_WABA_ID || '105382835942086',
            whatsappSubAccountId: process.env.WHATSAPP_SUB_ACCOUNT_ID || 'd6ddb224-251b-4d50-9891-f6140aa5141b',
            whatsappBasicUrl: process.env.WHATSAPP_BASIC_URL || 'https://iqwhatsapp.airtel.in:443/gateway/airtel-xchange/basic/whatsapp-manager/v1',
            whatsappContentUrl: process.env.WHATSAPP_CONTENT_URL || 'https://iqwhatsapp.airtel.in:443/gateway/airtel-xchange/whatsapp-content-manager/v1',
            whatsappWelcomeTemplateId: process.env.WHATSAPP_WELCOME_TEMPLATE_ID || '01k0scq4rbqeh6ch1jp4j33gd8',
            whatsappReminderTemplateId: process.env.WHATSAPP_REMINDER_TEMPLATE_ID || 'payment_reminder_template',
            emailApiKey: '',
            smsApiKey: ''
          },
          wifiDetails: {
            ssid: 'LibraryWiFi',
            password: 'library123'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await settingsCollection.insertOne(defaultSettings);
        console.log('Created default settings');
        
        const responseSettings = {
          ...defaultSettings,
          id: defaultSettings._id?.toString(),
          _id: undefined
        };
        
        return res.status(200).json(responseSettings);
      }
      
      const responseSettings = {
        ...settings,
        id: settings._id.toString(),
        _id: undefined
      };
      
      return res.status(200).json(responseSettings);
    }

    if (req.method === 'PUT') {
      console.log('Updating settings:', req.body);
      
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      // Remove id from update data
      delete updateData.id;

      await settingsCollection.updateOne(
        { type: 'app_settings' },
        { $set: updateData },
        { upsert: true }
      );

      const updatedSettings = await settingsCollection.findOne({ type: 'app_settings' });
      
      const responseSettings = {
        ...updatedSettings,
        id: updatedSettings._id.toString(),
        _id: undefined
      };

      console.log('Settings updated successfully');
      return res.status(200).json(responseSettings);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Settings API Error:', error);
    console.error('Error stack:', error.stack);
    
    // Return fallback data on error
    return handleFallback(req, res);
  }
}

function handleFallback(req, res) {
  console.log('Using fallback data for settings API');
  
  const fallbackSettings = {
    id: 'fallback',
    type: 'app_settings',
    library: {
      name: 'Central Library',
      address: '123 Main Street, City, State 12345',
      phone: '+91 98765 43210',
      email: 'info@centrallibrary.com',
      website: 'www.centrallibrary.com'
    },
    fees: {
      monthlyFee: 1000,
      halfDayFee: 600,
      fullDayFee: 1000,
      currency: 'INR',
      warningDays: 7
    },
    notifications: {
      whatsappEnabled: false,
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
    },
    wifiDetails: {
      ssid: 'LibraryWiFi',
      password: 'library123'
    }
  };

  if (req.method === 'GET') {
    return res.status(200).json(fallbackSettings);
  }

  if (req.method === 'PUT') {
    console.log('Updated fallback settings:', req.body);
    return res.status(200).json({ ...fallbackSettings, ...req.body });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}