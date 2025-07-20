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
        const student = await Student.findById(id);
        if (!student) {
          return res.status(404).json({ error: 'Student not found' });
        }
        return res.status(200).json(student);

      case 'PUT':
        const updates = req.body;
        const updatedStudent = await Student.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedStudent) {
          return res.status(404).json({ error: 'Student not found' });
        }
        return res.status(200).json(updatedStudent);

      case 'DELETE':
        const deletedStudent = await Student.findByIdAndDelete(id);
        if (!deletedStudent) {
          return res.status(404).json({ error: 'Student not found' });
        }
        return res.status(200).json({ message: 'Student deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}