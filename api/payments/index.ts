import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../src/lib/mongodb';
import Payment from '../../src/models/Payment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const payments = await Payment.find({})
          .populate('studentId', 'name')
          .sort({ dueDate: -1 });
        res.status(200).json(payments);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payments' });
      }
      break;

    case 'POST':
      try {
        const payment = new Payment(req.body);
        await payment.save();
        res.status(201).json(payment);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create payment' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}