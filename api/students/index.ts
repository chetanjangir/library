import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('API called:', req.method, req.url);

    switch (req.method) {
      case 'GET':
        // Return sample data for now
        const sampleStudents = [
          {
            id: '1',
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
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            mobile: '+1234567891',
            joinDate: '2023-11-05',
            planType: 'monthly',
            dayType: 'half',
            halfDaySlot: 'morning',
            status: 'active',
            seatNumber: 23,
            subscriptionEndDate: '2024-01-10',
            currency: 'USD',
            monthlyAmount: 100,
            halfDayAmount: 60,
            fullDayAmount: 100
          }
        ];
        
        return res.status(200).json(sampleStudents);

      case 'POST':
        const studentData = req.body;
        console.log('Creating student:', studentData);
        
        // Simulate creating a student
        const newStudent = {
          id: Date.now().toString(),
          ...studentData,
          joinDate: new Date().toISOString(),
          status: 'active'
        };
        
        return res.status(201).json(newStudent);

      case 'PUT':
        const { id } = req.query;
        const updates = req.body;
        console.log('Updating student:', id, updates);
        
        return res.status(200).json({ id, ...updates });

      case 'DELETE':
        const { id: deleteId } = req.query;
        console.log('Deleting student:', deleteId);
        
        return res.status(200).json({ message: 'Student deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}