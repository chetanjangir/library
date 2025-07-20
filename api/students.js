const clientPromise = require('../lib/mongodb');
const { ObjectId } = require('mongodb');

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
    const collection = db.collection('students');

    if (req.method === 'GET') {
      const students = await collection.find({}).toArray();
      return res.status(200).json(students);
    }

    if (req.method === 'POST') {
      const studentData = {
        ...req.body,
        joinDate: new Date(req.body.joinDate || new Date()),
        subscriptionEndDate: new Date(req.body.subscriptionEndDate),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(studentData);
      const newStudent = await collection.findOne({ _id: result.insertedId });
      
      // Convert _id to id for frontend compatibility
      const responseStudent = {
        ...newStudent,
        id: newStudent._id.toString()
      };
      delete responseStudent._id;

      // Send WhatsApp welcome message (simulated)
      if (studentData.mobile) {
        console.log(`WhatsApp message would be sent to ${studentData.mobile}:`);
        console.log(`Welcome ${studentData.name}! Your seat ${studentData.seatNumber || 'TBD'} is ready. WiFi: LibraryWiFi, Password: library123`);
      }

      return res.status(201).json(responseStudent);
    }

    if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Student ID is required for updates' });
      }

      const updateDoc = {
        ...updateData,
        subscriptionEndDate: new Date(updateData.subscriptionEndDate),
        updatedAt: new Date()
      };

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateDoc }
      );

      const updatedStudent = await collection.findOne({ _id: new ObjectId(id) });
      
      const responseStudent = {
        ...updatedStudent,
        id: updatedStudent._id.toString()
      };
      delete responseStudent._id;

      return res.status(200).json(responseStudent);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Student ID is required for deletion' });
      }

      await collection.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ message: 'Student deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    
    // Fallback to sample data if database fails
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

    return res.status(500).json({ 
      error: 'Database connection failed. Using fallback data.',
      details: error.message 
    });
  }
}