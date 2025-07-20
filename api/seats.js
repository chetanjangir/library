const clientPromise = require('../lib/mongodb');

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
      // Get all students to determine seat occupancy
      const students = await studentsCollection.find({}).toArray();
      
      // Create seat map
      const seats = [];
      for (let i = 1; i <= 100; i++) {
        const seat = {
          id: i,
          isOccupied: false,
          type: 'vacant'
        };

        // Check if this seat is occupied
        const fullDayStudent = students.find(s => s.seatNumber === i && s.dayType === 'full');
        const halfDayStudents = students.filter(s => s.seatNumber === i && s.dayType === 'half');

        if (fullDayStudent) {
          seat.isOccupied = true;
          seat.type = 'full';
          seat.student = {
            ...fullDayStudent,
            id: fullDayStudent._id.toString()
          };
        } else if (halfDayStudents.length > 0) {
          seat.isOccupied = true;
          seat.type = 'half-shared';
          seat.halfDayStudents = {};
          
          halfDayStudents.forEach(student => {
            const studentData = {
              ...student,
              id: student._id.toString()
            };
            if (student.halfDaySlot === 'morning') {
              seat.halfDayStudents.morning = studentData;
            } else if (student.halfDaySlot === 'evening') {
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