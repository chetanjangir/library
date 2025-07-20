import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../../src/lib/mongodb';
import Seat from '../../src/models/Seat';

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
          // Initialize 100 vacant seats if they don't exist
          const seatCount = await Seat.countDocuments().exec();
          if (seatCount === 0) {
            const seats = [];
            for (let i = 1; i <= 100; i++) {
              seats.push({ 
                seatNumber: i,
                isOccupied: false,
                type: 'vacant'
              });
            }
            await Seat.insertMany(seats);
          }

          const seats = await Seat.find({})
            .populate('fullDayStudent morningStudent eveningStudent')
            .sort({ seatNumber: 1 })
            .exec();
          
          return res.status(200).json(seats);
        } catch (error) {
          console.error('Error fetching seats:', error);
          return res.status(500).json({ error: 'Failed to fetch seats' });
        }

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}