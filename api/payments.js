export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const samplePayments = [
      {
        id: '1',
        studentId: '1',
        studentName: 'John Doe',
        amount: 100,
        currency: 'USD',
        dueDate: '2023-12-15',
        status: 'pending',
        planType: 'monthly',
        dayType: 'full'
      },
      {
        id: '2',
        studentId: '2',
        studentName: 'Jane Smith',
        amount: 60,
        currency: 'USD',
        dueDate: '2023-12-01',
        paidDate: '2023-11-28',
        status: 'paid',
        planType: 'monthly',
        dayType: 'half'
      }
    ];

    if (req.method === 'GET') {
      return res.status(200).json(samplePayments);
    }

    if (req.method === 'POST') {
      const newPayment = {
        id: Date.now().toString(),
        ...req.body
      };
      return res.status(201).json(newPayment);
    }

    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}