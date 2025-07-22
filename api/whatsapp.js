import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('WhatsApp API called:', req.method, req.url);

  try {
    if (req.method === 'POST') {
      const { type, mobile, studentName, amount, currency, dueDate, seatNumber, wifiSSID, wifiPassword } = req.body;

      // Get WhatsApp settings from MongoDB
      let settings = null;
      try {
        if (process.env.MONGODB_URI) {
          const client = await clientPromise;
          const db = client.db('library_management');
          const settingsCollection = db.collection('settings');
          settings = await settingsCollection.findOne({ type: 'app_settings' });
        }
      } catch (error) {
        console.log('Could not load settings from MongoDB, using environment variables');
      }

      // Get WhatsApp configuration
      const whatsappConfig = {
        username: settings?.notifications?.whatsappUsername || process.env.WHATSAPP_USERNAME || '',
        secret: settings?.notifications?.whatsappSecret || process.env.WHATSAPP_SECRET || '',
        senderNumber: settings?.notifications?.whatsappSenderNumber || process.env.WHATSAPP_SENDER_NUMBER || '919315431037',
        customerId: settings?.notifications?.whatsappCustomerId || process.env.WHATSAPP_CUSTOMER_ID || 'SALEASSIST_SKzeozJyiA96VM09HL4h',
        wabaId: settings?.notifications?.whatsappWabaId || process.env.WHATSAPP_WABA_ID || '105382835942086',
        subAccountId: settings?.notifications?.whatsappSubAccountId || process.env.WHATSAPP_SUB_ACCOUNT_ID || 'd6ddb224-251b-4d50-9891-f6140aa5141b',
        basicUrl: settings?.notifications?.whatsappBasicUrl || process.env.WHATSAPP_BASIC_URL || 'https://iqwhatsapp.airtel.in:443/gateway/airtel-xchange/basic/whatsapp-manager/v1',
        welcomeTemplateId: settings?.notifications?.whatsappWelcomeTemplateId || process.env.WHATSAPP_WELCOME_TEMPLATE_ID || '01k0scq4rbqeh6ch1jp4j33gd8',
        reminderTemplateId: settings?.notifications?.whatsappReminderTemplateId || process.env.WHATSAPP_REMINDER_TEMPLATE_ID || 'payment_reminder_template'
      };

      // Check if WhatsApp is enabled and configured
      const whatsappEnabled = settings?.notifications?.whatsappEnabled || false;
      if (!whatsappEnabled || !whatsappConfig.username || !whatsappConfig.secret) {
        return res.status(400).json({ 
          success: false, 
          error: 'WhatsApp service not configured or disabled' 
        });
      }

      // Format mobile number
      let formattedMobile = mobile.replace(/\D/g, '');
      if (formattedMobile.length === 10) {
        formattedMobile = '91' + formattedMobile; // Add India country code
      }

      let payload;
      let templateBody;

      if (type === 'welcome') {
        // Check if auto welcome is enabled
        if (settings?.notifications?.autoWelcomeEnabled === false) {
          return res.status(400).json({ 
            success: false, 
            error: 'Auto welcome messages are disabled' 
          });
        }

        const wifiName = wifiSSID || settings?.wifiDetails?.ssid || 'LibraryWiFi';
        const wifiPass = wifiPassword || settings?.wifiDetails?.password || 'library123';

        templateBody = 'Hi {{1}} \n Welcome to Samarth Library! \n Your seat no is : {{2}} \n Wifi name : {{3}} \n Wifi password : {{4}} \n Note: do not share seat and wifi details with anyone. Thanks';
        
        payload = {
          from: whatsappConfig.senderNumber,
          to: formattedMobile,
          body: templateBody,
          templateId: whatsappConfig.welcomeTemplateId,
          message: {
            variables: [
              studentName,
              seatNumber ? `${seatNumber}` : 'TBD',
              wifiName,
              wifiPass
            ]
          }
        };
      } else if (type === 'reminder') {
        // Check if auto reminders are enabled
        if (settings?.notifications?.autoReminderEnabled === false) {
          return res.status(400).json({ 
            success: false, 
            error: 'Auto reminder messages are disabled' 
          });
        }

        const currencySymbol = getCurrencySymbol(currency || 'INR');
        templateBody = 'Dear {{1}}, your payment of {{2}}{{3}} is due on {{4}}. Please make the payment to continue using our library services.';
        
        payload = {
          from: whatsappConfig.senderNumber,
          to: formattedMobile,
          body: templateBody,
          templateId: whatsappConfig.reminderTemplateId,
          message: {
            variables: [
              studentName,
              currencySymbol,
              amount ? amount.toString() : '0',
              dueDate || new Date().toLocaleDateString()
            ]
          }
        };
      } else {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid message type' 
        });
      }

      console.log('Sending WhatsApp message:', payload);

      // Create authorization header
      const credentials = `${whatsappConfig.username}:${whatsappConfig.secret}`;
      const encoded = Buffer.from(credentials).toString('base64');
      
      const headers = {
        'Authorization': `basic ${encoded}`,
        'Content-Type': 'application/json'
      };

      // Send WhatsApp message via Airtel API
      const response = await fetch(`${whatsappConfig.basicUrl}/template/send`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('WhatsApp message sent successfully:', result);
        
        // Replace variables in template for logging
        const finalMessage = replaceVariables(templateBody, payload.message.variables);
        console.log('Final message sent:', finalMessage);
        
        return res.status(200).json({
          success: true,
          message: 'WhatsApp message sent successfully',
          messageRequestId: result.messageRequestId,
          finalMessage: finalMessage
        });
      } else {
        const error = await response.json();
        console.error('WhatsApp message failed:', error);
        return res.status(400).json({
          success: false,
          error: 'Failed to send WhatsApp message',
          details: error
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('WhatsApp API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

function getCurrencySymbol(currency) {
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'INR': '₹',
    'GBP': '£'
  };
  return symbols[currency] || currency;
}

function replaceVariables(template, variables) {
  let result = template;
  variables.forEach((variable, index) => {
    result = result.replace(`{{${index + 1}}}`, variable);
  });
  return result;
}