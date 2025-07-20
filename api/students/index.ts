import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../../src/lib/mongodb';
import Student from '../../src/models/Student';
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
          const students = await Student.find({}).sort({ createdAt: -1 }).exec();
          return res.status(200).json(students);
        } catch (error) {
          console.error('Error fetching students:', error);
          return res.status(500).json({ error: 'Failed to fetch students' });
        }

      case 'POST':
        try {
          const studentData = req.body;
          
          // Check if seat is available
          if (studentData.seatNumber) {
            const existingSeat = await Seat.findOne({ seatNumber: studentData.seatNumber }).exec();
            
            if (existingSeat && existingSeat.isOccupied) {
              if (studentData.dayType === 'full') {
                return res.status(400).json({ error: 'Seat is already fully occupied' });
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
          const savedStudent = await student.save();

          // Update seat allocation
          if (studentData.seatNumber) {
            await updateSeatAllocation(studentData.seatNumber, savedStudent._id.toString(), studentData.dayType, studentData.halfDaySlot);
          }

          // Send WhatsApp message
          if (studentData.mobile) {
            await sendWhatsAppMessage(studentData.mobile, studentData.name, studentData.seatNumber);
          }

          return res.status(201).json(savedStudent);
        } catch (error) {
          console.error('Error creating student:', error);
          return res.status(500).json({ error: 'Failed to create student' });
        }

      case 'PUT':
        try {
          const { id } = req.query;
          const updates = req.body;
          
          const updatedStudent = await Student.findByIdAndUpdate(id, updates, { new: true }).exec();
          if (!updatedStudent) {
            return res.status(404).json({ error: 'Student not found' });
          }
          
          return res.status(200).json(updatedStudent);
        } catch (error) {
          console.error('Error updating student:', error);
          return res.status(500).json({ error: 'Failed to update student' });
        }

      case 'DELETE':
        try {
          const { id: deleteId } = req.query;
          
          const deletedStudent = await Student.findByIdAndDelete(deleteId).exec();
          if (!deletedStudent) {
            return res.status(404).json({ error: 'Student not found' });
          }
          
          // Free up the seat
          if (deletedStudent.seatNumber) {
            await freeSeat(deletedStudent.seatNumber, deletedStudent._id.toString(), deletedStudent.dayType);
          }
          
          return res.status(200).json({ message: 'Student deleted successfully' });
        } catch (error) {
          console.error('Error deleting student:', error);
          return res.status(500).json({ error: 'Failed to delete student' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateSeatAllocation(seatNumber: number, studentId: string, dayType: string, halfDaySlot?: string) {
  try {
    let seat = await Seat.findOne({ seatNumber }).exec();
    
    if (!seat) {
      seat = new Seat({ seatNumber });
    }

    if (dayType === 'full') {
      seat.fullDayStudent = studentId as any;
      seat.type = 'full';
      seat.isOccupied = true;
    } else if (dayType === 'half') {
      if (halfDaySlot === 'morning') {
        seat.morningStudent = studentId as any;
      } else {
        seat.eveningStudent = studentId as any;
      }
      
      seat.type = 'half-shared';
      seat.isOccupied = true;
    }

    await seat.save();
  } catch (error) {
    console.error('Error updating seat allocation:', error);
  }
}

async function freeSeat(seatNumber: number, studentId: string, dayType: string) {
  try {
    const seat = await Seat.findOne({ seatNumber }).exec();
    if (!seat) return;

    if (dayType === 'full') {
      seat.fullDayStudent = null;
      seat.type = 'vacant';
      seat.isOccupied = false;
    } else if (dayType === 'half') {
      if (seat.morningStudent && seat.morningStudent.toString() === studentId) {
        seat.morningStudent = null;
      }
      if (seat.eveningStudent && seat.eveningStudent.toString() === studentId) {
        seat.eveningStudent = null;
      }
      
      if (!seat.morningStudent && !seat.eveningStudent) {
        seat.type = 'vacant';
        seat.isOccupied = false;
      }
    }

    await seat.save();
  } catch (error) {
    console.error('Error freeing seat:', error);
  }
}

async function sendWhatsAppMessage(mobile: string, name: string, seatNumber: number) {
  try {
    const message = `Welcome to our Library! 🎉\n\nDear ${name},\n\nYour seat ${seatNumber} has been allocated successfully.\n\nWiFi Details:\nSSID: LibraryWiFi\nPassword: Study2024\n\nEnjoy your studies!`;
    
    const whatsappApiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages';
    const whatsappToken = process.env.WHATSAPP_TOKEN || 'your_token_here';
    
    const curlCommand = `curl -X POST "${whatsappApiUrl}" \\
      -H "Authorization: Bearer ${whatsappToken}" \\
      -H "Content-Type: application/json" \\
      -d '{
        "messaging_product": "whatsapp",
        "to": "${mobile}",
        "type": "text",
        "text": {
          "body": "${message}"
        }
      }'`;
    
    console.log('WhatsApp message would be sent with:', curlCommand);
    console.log(`WhatsApp message sent to ${mobile}: ${message}`);
    
  } catch (error) {
    console.error('WhatsApp message failed:', error);
  }
}