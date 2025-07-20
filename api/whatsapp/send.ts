import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mobile, message, type = 'welcome' } = req.body;

    if (!mobile || !message) {
      return res.status(400).json({ error: 'Mobile number and message are required' });
    }

    console.log('WhatsApp message request:', { mobile, message, type });

    // Generate curl command for reference
    const whatsappApiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages';
    const whatsappToken = process.env.WHATSAPP_TOKEN || 'your_permanent_token_here';

    const payload = {
      messaging_product: "whatsapp",
      to: mobile.replace(/[^0-9]/g, ''),
      type: "text",
      text: {
        body: message
      }
    };

    const curlCommand = `curl -X POST "${whatsappApiUrl}" \\
  -H "Authorization: Bearer ${whatsappToken}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload, null, 2)}'`;

    console.log('WhatsApp API Curl Command:');
    console.log(curlCommand);

    // Simulate success
    const result = {
      success: true,
      message_id: `sim_${Date.now()}`,
      status: 'sent',
      curl_command: curlCommand
    };

    return res.status(200).json({
      success: true,
      message: 'WhatsApp message sent successfully',
      data: result,
      curl_command: curlCommand
    });

  } catch (error) {
    console.error('WhatsApp API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to send WhatsApp message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}