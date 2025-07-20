import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../src/lib/mongodb';
import Student from '../../src/models/Student';
import Seat from '../../src/models/Seat';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const students = await Student.find({}).sort({ createdAt: -1 });
        res.status(200).json(students);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
      }
      break;

    case 'POST':
      try {
        const studentData = req.body;
        
        // Check if seat is available
        if (studentData.seatNumber) {
          const existingSeat = await Seat.findOne({ seatNumber: studentData.seatNumber });
          
          if (existingSeat) {
            if (studentData.dayType === 'full' && existingSeat.isOccupied) {
              return res.status(400).json({ error: 'Seat is already occupied' });
            }
            
            if (studentData.dayType === 'half') {
              const slotField = studentData.halfDaySlot === 'morning' ? 'morningStudent' : 'eveningStudent';
              if (existingSeat[slotField]) {
                return res.status(400).json({ error: `${studentData.halfDaySlot} slot is already occupied` });
              }
            }
          }
        }

        const student = new Student(studentData);
        await student.save();

        // Update seat allocation
        if (studentData.seatNumber) {
          await updateSeatAllocation(studentData.seatNumber, student._id, studentData.dayType, studentData.halfDaySlot);
        }

        res.status(201).json(student);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create student' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function updateSeatAllocation(seatNumber: number, studentId: string, dayType: string, halfDaySlot?: string) {
  let seat = await Seat.findOne({ seatNumber });
  
  if (!seat) {
    seat = new Seat({ seatNumber });
  }

  if (dayType === 'full') {
    seat.fullDayStudent = studentId;
    seat.type = 'full';
    seat.isOccupied = true;
  } else if (dayType === 'half') {
    if (halfDaySlot === 'morning') {
      seat.morningStudent = studentId;
    } else {
      seat.eveningStudent = studentId;
    }
    
    if (seat.morningStudent && seat.eveningStudent) {
      seat.type = 'half-shared';
    } else {
      seat.type = 'half-shared';
    }
    seat.isOccupied = true;
  }

  await seat.save();
}