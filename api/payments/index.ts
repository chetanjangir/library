import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Payments API called:', req.method);

    switch (req.method) {
      case 'GET':
        const samplePayments = [
          {
            id: '1',
            studentId: '1',
            studentName: 'John Doe',
            amount: 100,
            currency: 'USD',
            dueDate: '2023-12-15',
            status: 'pending',
            planType: 'monthly',
            dayType: 'full'
          },
          {
            id: '2',
            studentId: '2',
            studentName: 'Jane Smith',
            amount: 60,
            currency: 'USD',
            dueDate: '2023-12-01',
            paidDate: '2023-11-28',
            status: 'paid',
            planType: 'monthly',
            dayType: 'half'
          }
        ];
        
        return res.status(200).json(samplePayments);

      case 'POST':
        const paymentData = req.body;
        console.log('Creating payment:', paymentData);
        
        const newPayment = {
          id: Date.now().toString(),
          ...paymentData
        };
        
        return res.status(201).json(newPayment);

      case 'PUT':
        const { id } = req.query;
        const updates = req.body;
        console.log('Updating payment:', id, updates);
        
        return res.status(200).json({ id, ...updates });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Payments API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}