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
        const students = await Student.find({}).sort({ createdAt: -1 });
        return res.status(200).json(students);

      case 'POST':
        const studentData = req.body;
        
        // Check if seat is available
        if (studentData.seatNumber) {
          const existingSeat = await Seat.findOne({ seatNumber: studentData.seatNumber });
          
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
        await student.save();

        // Update seat allocation
        if (studentData.seatNumber) {
          await updateSeatAllocation(studentData.seatNumber, student._id, studentData.dayType, studentData.halfDaySlot);
        }

        // Send WhatsApp message
        if (studentData.mobile) {
          await sendWhatsAppMessage(studentData.mobile, studentData.name, studentData.seatNumber);
        }

        return res.status(201).json(student);

      case 'PUT':
        const { id } = req.query;
        const updates = req.body;
        
        const updatedStudent = await Student.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedStudent) {
          return res.status(404).json({ error: 'Student not found' });
        }
        
        return res.status(200).json(updatedStudent);

      case 'DELETE':
        const { id: deleteId } = req.query;
        
        const deletedStudent = await Student.findByIdAndDelete(deleteId);
        if (!deletedStudent) {
          return res.status(404).json({ error: 'Student not found' });
        }
        
        // Free up the seat
        if (deletedStudent.seatNumber) {
          await freeSeat(deletedStudent.seatNumber, deletedStudent._id, deletedStudent.dayType);
        }
        
        return res.status(200).json({ message: 'Student deleted successfully' });

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
    
    seat.type = 'half-shared';
    seat.isOccupied = true;
  }

  await seat.save();
}

async function freeSeat(seatNumber: number, studentId: string, dayType: string) {
  const seat = await Seat.findOne({ seatNumber });
  if (!seat) return;

  if (dayType === 'full') {
    seat.fullDayStudent = null;
    seat.type = 'vacant';
    seat.isOccupied = false;
  } else if (dayType === 'half') {
    if (seat.morningStudent?.toString() === studentId.toString()) {
      seat.morningStudent = null;
    }
    if (seat.eveningStudent?.toString() === studentId.toString()) {
      seat.eveningStudent = null;
    }
    
    if (!seat.morningStudent && !seat.eveningStudent) {
      seat.type = 'vacant';
      seat.isOccupied = false;
    }
  }

  await seat.save();
}

async function sendWhatsAppMessage(mobile: string, name: string, seatNumber: number) {
  // WhatsApp API integration using curl command
  const message = `Welcome to our Library! 🎉\n\nDear ${name},\n\nYour seat ${seatNumber} has been allocated successfully.\n\nWiFi Details:\nSSID: LibraryWiFi\nPassword: Study2024\n\nEnjoy your studies!`;
  
  // This would be your actual WhatsApp API call
  // Replace with your WhatsApp Business API credentials
  const whatsappApiUrl = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/send';
  const whatsappToken = process.env.WHATSAPP_TOKEN || 'your_token_here';
  
  try {
    // Example curl command that would be executed
    const curlCommand = `curl -X POST "${whatsappApiUrl}" \
      -H "Authorization: Bearer ${whatsappToken}" \
      -H "Content-Type: application/json" \
      -d '{
        "messaging_product": "whatsapp",
        "to": "${mobile}",
        "type": "text",
        "text": {
          "body": "${message}"
        }
      }'`;
    
    console.log('WhatsApp message would be sent with:', curlCommand);
    
    // For now, we'll just log the message
    console.log(`WhatsApp message sent to ${mobile}: ${message}`);
    
  } catch (error) {
    console.error('WhatsApp message failed:', error);
  }
}