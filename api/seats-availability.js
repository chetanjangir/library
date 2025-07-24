import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Check if MongoDB URI is available
      if (!process.env.MONGODB_URI) {
        console.log('No MongoDB URI found, returning all seats as available');
        const availableSeats = [];
        for (let i = 1; i <= 100; i++) {
          availableSeats.push({ seatNumber: i, type: 'vacant' });
        }
        return res.status(200).json(availableSeats);
      }

      const client = await clientPromise;
      const db = client.db('library_management');
      const studentsCollection = db.collection('students');

      // Get all active students with seat assignments
      const occupiedSeats = await studentsCollection.find({ 
        status: { $in: ['active', 'expired'] },
        seat_number: { $exists: true, $ne: null }
      }).toArray();

      // Create a map of occupied seats
      const seatMap = {};
      occupiedSeats.forEach(student => {
        const seatNum = student.seat_number;
        if (!seatMap[seatNum]) {
          seatMap[seatNum] = { full: null, morning: null, evening: null };
        }

        if (student.day_type === 'full') {
          seatMap[seatNum].full = student;
        } else if (student.day_type === 'half') {
          if (student.half_day_slot === 'morning') {
            seatMap[seatNum].morning = student;
          } else if (student.half_day_slot === 'evening') {
            seatMap[seatNum].evening = student;
          }
        }
      });

      // Generate available seats list
      const availableSeats = [];
      
      for (let i = 1; i <= 100; i++) {
        const seat = seatMap[i];
        
        if (!seat) {
          // Completely vacant seat
          availableSeats.push({
            seatNumber: i,
            type: 'vacant',
            availability: 'full'
          });
        } else if (!seat.full) {
          // Not occupied by full day student
          if (!seat.morning && !seat.evening) {
            // Both slots available
            availableSeats.push({
              seatNumber: i,
              type: 'vacant',
              availability: 'full'
            });
          } else if (!seat.morning) {
            // Morning slot available
            availableSeats.push({
              seatNumber: i,
              type: 'half-available',
              availability: 'morning'
            });
          } else if (!seat.evening) {
            // Evening slot available
            availableSeats.push({
              seatNumber: i,
              type: 'half-available',
              availability: 'evening'
            });
          }
        }
        // If seat.full exists, seat is completely occupied - don't add to available list
      }

      return res.status(200).json(availableSeats);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Seats availability API Error:', error);
    
    // Fallback to all seats available
    const availableSeats = [];
    for (let i = 1; i <= 100; i++) {
      availableSeats.push({ seatNumber: i, type: 'vacant', availability: 'full' });
    }
    return res.status(200).json(availableSeats);
  }
}