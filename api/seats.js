import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await clientPromise;
    const db = client.db('library_management');
    const studentsCollection = db.collection('students');

    if (req.method === 'GET') {
      // Get only active students to determine seat occupancy
      const students = await studentsCollection.find({ 
        status: { $in: ['active', 'expired'] }
      }).toArray();
      
      // Create seat map
      const seats = [];
      for (let i = 1; i <= 100; i++) {
        const seat = {
          id: i,
          isOccupied: false,
          type: 'vacant'
        };

        // Check if this seat is occupied
        const fullDayStudent = students.find(s => s.seat_number === i && s.day_type === 'full');
        const halfDayStudents = students.filter(s => s.seat_number === i && s.day_type === 'half');

        if (fullDayStudent) {
          seat.isOccupied = true;
          seat.type = 'full';
          seat.student = {
            ...fullDayStudent,
            id: fullDayStudent._id.toString(),
            name: fullDayStudent.name,
            email: fullDayStudent.email,
            mobile: fullDayStudent.mobile,
            planType: fullDayStudent.plan_type,
            dayType: fullDayStudent.day_type,
            status: fullDayStudent.status,
            seatNumber: fullDayStudent.seat_number,
            currency: fullDayStudent.currency,
            _id: undefined
          };
        } else if (halfDayStudents.length > 0) {
          seat.isOccupied = true;
          seat.type = 'half-shared';
          seat.halfDayStudents = {};
          
          halfDayStudents.forEach(student => {
            const studentData = {
              ...student,
              id: student._id.toString(),
              name: student.name,
              email: student.email,
              mobile: student.mobile,
              planType: student.plan_type,
              dayType: student.day_type,
              halfDaySlot: student.half_day_slot,
              status: student.status,
              seatNumber: student.seat_number,
              currency: student.currency,
              _id: undefined
            };
            if (student.half_day_slot === 'morning') {
              seat.halfDayStudents.morning = studentData;
            } else if (student.half_day_slot === 'evening') {
              seat.halfDayStudents.evening = studentData;
            }
          });
        }

        seats.push(seat);
      }

      return res.status(200).json(seats);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Seats API Error:', error);
    
    // Fallback to vacant seats
    const seats = [];
    for (let i = 1; i <= 100; i++) {
      seats.push({
        id: i,
        isOccupied: false,
        type: 'vacant'
      });
    }

    return res.status(200).json(seats);
  }
}