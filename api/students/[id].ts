import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../../src/lib/mongodb';
import Student from '../../src/models/Student';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    await connectDB();

    switch (req.method) {
      case 'GET':
        try {
          const student = await Student.findById(id).exec();
          if (!student) {
            return res.status(404).json({ error: 'Student not found' });
          }
          return res.status(200).json(student);
        } catch (error) {
          console.error('Error fetching student:', error);
          return res.status(500).json({ error: 'Failed to fetch student' });
        }

      case 'PUT':
        try {
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
          const deletedStudent = await Student.findByIdAndDelete(id).exec();
          if (!deletedStudent) {
            return res.status(404).json({ error: 'Student not found' });
          }
          return res.status(200).json({ message: 'Student deleted successfully' });
        } catch (error) {
          console.error('Error deleting student:', error);
          return res.status(500).json({ error: 'Failed to delete student' });
        }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}