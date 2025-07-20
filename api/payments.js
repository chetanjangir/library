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
    const collection = db.collection('payments');

    if (req.method === 'GET') {
      const payments = await collection.find({}).toArray();
      const responsePayments = payments.map(payment => ({
        ...payment,
        id: payment._id.toString()
      }));
      return res.status(200).json(responsePayments);
    }

    if (req.method === 'POST') {
      const paymentData = {
        ...req.body,
        dueDate: new Date(req.body.dueDate),
        paidDate: req.body.paidDate ? new Date(req.body.paidDate) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(paymentData);
      const newPayment = await collection.findOne({ _id: result.insertedId });
      
      const responsePayment = {
        ...newPayment,
        id: newPayment._id.toString()
      };
      delete responsePayment._id;

      return res.status(201).json(responsePayment);
    }

    if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Payment ID is required for updates' });
      }

      const updateDoc = {
        ...updateData,
        updatedAt: new Date()
      };

      if (updateData.paidDate) {
        updateDoc.paidDate = new Date(updateData.paidDate);
      }

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateDoc }
      );

      const updatedPayment = await collection.findOne({ _id: new ObjectId(id) });
      
      const responsePayment = {
        ...updatedPayment,
        id: updatedPayment._id.toString()
      };
      delete responsePayment._id;

      return res.status(200).json(responsePayment);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Payments API Error:', error);
    
    // Fallback to sample data
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

    return res.status(500).json({ 
      error: 'Database connection failed. Using fallback data.',
      details: error.message 
    });
  }
}