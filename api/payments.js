import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Payments API called:', req.method, req.url);

  try {
    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      console.log('No MongoDB URI found, using fallback data');
      return handleFallback(req, res);
    }

    const client = await clientPromise;
    const db = client.db('library_management');
    const paymentsCollection = db.collection('payments');
    const studentsCollection = db.collection('students');

    if (req.method === 'GET') {
      console.log('Fetching payments from MongoDB...');
      
      // Get all payments from database
      const payments = await paymentsCollection.find({}).sort({ due_date: -1 }).toArray();
      console.log(`Found ${payments.length} payments in database`);
      
      // Get all students to enrich payment data
      const students = await studentsCollection.find({}).toArray();
      const studentsMap = {};
      students.forEach(student => {
        studentsMap[student._id.toString()] = student;
      });
      
      // Convert payments to frontend format
      const responsePayments = payments.map(payment => {
        const student = studentsMap[payment.student_id];
        return {
          id: payment._id.toString(),
          studentId: payment.student_id,
          studentName: payment.student_name || (student ? student.name : 'Unknown'),
          amount: payment.amount,
          currency: payment.currency || 'INR',
          dueDate: payment.due_date ? payment.due_date.toISOString().split('T')[0] : null,
          paidDate: payment.paid_date ? payment.paid_date.toISOString().split('T')[0] : null,
          status: payment.status || 'pending',
          planType: payment.plan_type || 'monthly',
          dayType: payment.day_type || 'full',
          createdAt: payment.created_at,
          updatedAt: payment.updated_at,
          _id: undefined
        };
      });
      
      console.log(`Returning ${responsePayments.length} payments`);
      return res.status(200).json(responsePayments);
    }

    if (req.method === 'POST') {
      console.log('Creating new payment:', req.body);
      
      const paymentData = {
        student_id: req.body.studentId,
        student_name: req.body.studentName,
        amount: parseFloat(req.body.amount),
        currency: req.body.currency || 'INR',
        due_date: new Date(req.body.dueDate),
        paid_date: req.body.paidDate ? new Date(req.body.paidDate) : null,
        status: req.body.status || 'pending',
        plan_type: req.body.planType || 'monthly',
        day_type: req.body.dayType || 'full',
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await paymentsCollection.insertOne(paymentData);
      console.log('Payment created with ID:', result.insertedId);
      
      const newPayment = await paymentsCollection.findOne({ _id: result.insertedId });
      
      const responsePayment = {
        id: newPayment._id.toString(),
        studentId: newPayment.student_id,
        studentName: newPayment.student_name,
        amount: newPayment.amount,
        currency: newPayment.currency,
        dueDate: newPayment.due_date ? newPayment.due_date.toISOString().split('T')[0] : null,
        paidDate: newPayment.paid_date ? newPayment.paid_date.toISOString().split('T')[0] : null,
        status: newPayment.status,
        planType: newPayment.plan_type,
        dayType: newPayment.day_type,
        _id: undefined
      };

      return res.status(201).json(responsePayment);
    }

    if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Payment ID is required for updates' });
      }

      console.log('Updating payment:', id, updateData);

      const { ObjectId } = await import('mongodb');
      const updateDoc = {
        student_id: updateData.studentId,
        student_name: updateData.studentName,
        amount: parseFloat(updateData.amount),
        currency: updateData.currency || 'INR',
        status: updateData.status || 'pending',
        plan_type: updateData.planType || 'monthly',
        day_type: updateData.dayType || 'full',
        updated_at: new Date()
      };

      if (updateData.dueDate) {
        updateDoc.due_date = new Date(updateData.dueDate);
      }
      if (updateData.paidDate) {
        updateDoc.paid_date = new Date(updateData.paidDate);
      }
      if (updateData.status === 'paid' && !updateData.paidDate) {
        updateDoc.paid_date = new Date();
      }

      // Remove undefined values
      Object.keys(updateDoc).forEach(key => {
        if (updateDoc[key] === undefined) {
          delete updateDoc[key];
        }
      });

      await paymentsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateDoc }
      );

      const updatedPayment = await paymentsCollection.findOne({ _id: new ObjectId(id) });
      
      const responsePayment = {
        id: updatedPayment._id.toString(),
        studentId: updatedPayment.student_id,
        studentName: updatedPayment.student_name,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        dueDate: updatedPayment.due_date ? updatedPayment.due_date.toISOString().split('T')[0] : null,
        paidDate: updatedPayment.paid_date ? updatedPayment.paid_date.toISOString().split('T')[0] : null,
        status: updatedPayment.status,
        planType: updatedPayment.plan_type,
        dayType: updatedPayment.day_type,
        _id: undefined
      };

      return res.status(200).json(responsePayment);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Payment ID is required for deletion' });
      }

      console.log('Deleting payment:', id);
      const { ObjectId } = await import('mongodb');
      const result = await paymentsCollection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      return res.status(200).json({ 
        message: 'Payment deleted successfully',
        deletedId: id
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Payments API Error:', error);
    console.error('Error stack:', error.stack);
    
    // Return fallback data on error
    return handleFallback(req, res);
  }
}

function handleFallback(req, res) {
  console.log('Using fallback data for payments API');
  
  const samplePayments = [
    {
      id: '1',
      studentId: '1',
      studentName: 'Sample Student',
      amount: 1000,
      currency: 'INR',
      dueDate: '2024-01-15',
      status: 'paid',
      planType: 'monthly',
      dayType: 'full',
      paidDate: '2024-01-10'
    }
  ];

  if (req.method === 'GET') {
    return res.status(200).json(samplePayments);
  }

  if (req.method === 'POST') {
    const newPayment = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    console.log('Created fallback payment:', newPayment.studentName);
    return res.status(201).json(newPayment);
  }

  if (req.method === 'PUT') {
    const updatedPayment = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    console.log('Updated fallback payment:', updatedPayment.id);
    return res.status(200).json(updatedPayment);
  }

  if (req.method === 'DELETE') {
    console.log('Deleted fallback payment:', req.body.id);
    return res.status(200).json({ message: 'Payment deleted successfully (fallback)' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}