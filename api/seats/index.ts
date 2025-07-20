import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../src/lib/mongodb';
import Seat from '../../src/models/Seat';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        // Initialize seats if they don't exist
        const seatCount = await Seat.countDocuments();
        if (seatCount === 0) {
          const seats = [];
          for (let i = 1; i <= 100; i++) {
            seats.push({ seatNumber: i });
          }
          await Seat.insertMany(seats);
        }

        const seats = await Seat.find({})
          .populate('fullDayStudent morningStudent eveningStudent')
          .sort({ seatNumber: 1 });
        
        res.status(200).json(seats);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch seats' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}