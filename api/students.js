import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Log the request for debugging
  console.log('Students API called:', req.method, req.url);

  try {
    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      console.log('No MongoDB URI found, using fallback data');
      return handleFallback(req, res);
    }

    const client = await clientPromise;
    const db = client.db('library_management');
    const collection = db.collection('students');

    if (req.method === 'GET') {
      console.log('Fetching students from MongoDB...');
      const students = await collection.find({}).toArray();
      console.log(`Found ${students.length} students`);
      
      const responseStudents = students.map(student => ({
        ...student,
        id: student._id.toString(),
        _id: undefined
      }));
      
      return res.status(200).json(responseStudents);
    }

    if (req.method === 'POST') {
      console.log('Creating new student:', req.body.name);
      
      const studentData = {
        ...req.body,
        joinDate: new Date(req.body.joinDate || new Date()),
        subscriptionEndDate: new Date(req.body.subscriptionEndDate),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(studentData);
      console.log('Student created with ID:', result.insertedId);
      
      const newStudent = await collection.findOne({ _id: result.insertedId });
      
      const responseStudent = {
        ...newStudent,
        id: newStudent._id.toString(),
        _id: undefined
      };

      // Log WhatsApp message (simulated)
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

      console.log('Updating student:', id);

      const { ObjectId } = await import('mongodb');
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
        id: updatedStudent._id.toString(),
        _id: undefined
      };

      return res.status(200).json(responseStudent);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Student ID is required for deletion' });
      }

      console.log('Deleting student:', id);
      const { ObjectId } = await import('mongodb');
      await collection.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ message: 'Student deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Students API Error:', error);
    console.error('Error stack:', error.stack);
    
    // Return fallback data on error
    return handleFallback(req, res);
  }
}

function handleFallback(req, res) {
  console.log('Using fallback data for students API');
  
  const sampleStudents = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      mobile: '+1234567890',
      joinDate: '2023-11-01T00:00:00.000Z',
      planType: 'monthly',
      dayType: 'full',
      status: 'active',
      seatNumber: 15,
      subscriptionEndDate: '2024-01-15T00:00:00.000Z',
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
      joinDate: '2023-11-05T00:00:00.000Z',
      planType: 'monthly',
      dayType: 'half',
      halfDaySlot: 'morning',
      status: 'active',
      seatNumber: 23,
      subscriptionEndDate: '2024-01-10T00:00:00.000Z',
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
      status: 'active',
      joinDate: new Date().toISOString(),
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    console.log('Created fallback student:', newStudent.name);
    return res.status(201).json(newStudent);
  }

  if (req.method === 'PUT') {
    const updatedStudent = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    console.log('Updated fallback student:', updatedStudent.id);
    return res.status(200).json(updatedStudent);
  }

  if (req.method === 'DELETE') {
    console.log('Deleted fallback student:', req.query.id);
    return res.status(200).json({ message: 'Student deleted successfully (fallback)' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}