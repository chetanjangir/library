export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
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

    if (req.method === 'GET') {
      return res.status(200).json(sampleStudents);
    }

    if (req.method === 'POST') {
      const newStudent = {
        id: Date.now().toString(),
        ...req.body,
        status: 'active'
      };
      return res.status(201).json(newStudent);
    }

    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}