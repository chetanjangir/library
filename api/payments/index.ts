import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../../src/lib/mongodb';
import Payment from '../../src/models/Payment';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    switch (req.method) {
      case 'GET':
        try {
          const payments = await Payment.find({})
            .populate('studentId', 'name')
            .sort({ dueDate: -1 })
            .exec();
          return res.status(200).json(payments);
        } catch (error) {
          console.error('Error fetching payments:', error);
          return res.status(500).json({ error: 'Failed to fetch payments' });
        }

      case 'POST':
        try {
          const paymentData = req.body;
          const payment = new Payment(paymentData);
          const savedPayment = await payment.save();
          return res.status(201).json(savedPayment);
        } catch (error) {
          console.error('Error creating payment:', error);
          return res.status(500).json({ error: 'Failed to create payment' });
        }

      case 'PUT':
        try {
          const { id } = req.query;
          const updates = req.body;
          
          const updatedPayment = await Payment.findByIdAndUpdate(id, updates, { new: true }).exec();
          if (!updatedPayment) {
            return res.status(404).json({ error: 'Payment not found' });
          }
          
          return res.status(200).json(updatedPayment);
        } catch (error) {
          console.error('Error updating payment:', error);
          return res.status(500).json({ error: 'Failed to update payment' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}