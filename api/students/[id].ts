import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    console.log('Student by ID API called:', req.method, id);

    switch (req.method) {
      case 'GET':
        // Return sample student data
        const student = {
          id: id,
          name: 'John Doe',
          email: 'john@example.com',
          mobile: '+1234567890',
          joinDate: '2023-11-01',
          planType: 'monthly',
          dayType: 'full',
          status: 'active',
          seatNumber: 15,
          subscriptionEndDate: '2024-01-15',
          currency: 'USD',
          monthlyAmount: 100,
          halfDayAmount: 60,
          fullDayAmount: 100
        };
        
        return res.status(200).json(student);

      case 'PUT':
        const updates = req.body;
        console.log('Updating student:', id, updates);
        
        const updatedStudent = {
          id: id,
          ...updates
        };
        
        return res.status(200).json(updatedStudent);

      case 'DELETE':
        console.log('Deleting student:', id);
        return res.status(200).json({ message: 'Student deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Student by ID API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}