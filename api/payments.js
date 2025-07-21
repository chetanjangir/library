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
      
      // Get all students to generate payments
      const students = await studentsCollection.find({}).toArray();
      console.log(`Found ${students.length} students for payment calculation`);
      
      // Get existing payments
      const existingPayments = await paymentsCollection.find({}).toArray();
      console.log(`Found ${existingPayments.length} existing payments`);
      
      // Generate payments for each student
      const allPayments = [];
      
      for (const student of students) {
        // Calculate monthly payment amount based on day type
        const monthlyAmount = student.dayType === 'half' ? student.halfDayAmount : student.fullDayAmount;
        
        // Generate payment for current month
        const currentDate = new Date();
        const paymentDueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15); // 15th of each month
        
        // Determine payment status based on due date and subscription end date
        const now = new Date();
        const subscriptionEndDate = new Date(student.subscription_end_date);
        let paymentStatus = 'pending';
        
        if (paymentDueDate < now) {
          if (subscriptionEndDate < now) {
            paymentStatus = 'expired';
          } else {
            paymentStatus = 'overdue';
          }
        } else {
          paymentStatus = 'due';
        }
        
        // Check if payment already exists for this student and month
        const existingPayment = existingPayments.find(p => 
          p.studentId === student._id.toString() && 
          new Date(p.dueDate).getMonth() === paymentDueDate.getMonth() &&
          new Date(p.dueDate).getFullYear() === paymentDueDate.getFullYear()
        );
        
        if (existingPayment) {
          // Update status if needed
          let updatedStatus = existingPayment.status;
          if (existingPayment.status !== 'paid') {
            updatedStatus = paymentStatus;
            
            // Update in database if status changed
            if (updatedStatus !== existingPayment.status) {
              await paymentsCollection.updateOne(
                { _id: existingPayment._id },
                { $set: { status: updatedStatus, updated_at: new Date() } }
              );
            }
          }
          
          // Use existing payment
          allPayments.push({
            ...existingPayment,
            id: existingPayment._id.toString(),
            studentName: student.name,
            status: updatedStatus,
            _id: undefined
          });
        } else {
          // Create new payment record
          const newPayment = {
            studentId: student._id.toString(),
            studentName: student.name,
            amount: monthlyAmount,
            currency: student.currency,
            dueDate: paymentDueDate.toISOString(),
            status: paymentStatus,
            planType: student.planType,
            dayType: student.dayType,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Insert into database
          const result = await paymentsCollection.insertOne(newPayment);
          
          allPayments.push({
            ...newPayment,
            id: result.insertedId.toString(),
            _id: undefined
          });
        }
      }
      
      console.log(`Returning ${allPayments.length} payments`);
      return res.status(200).json(allPayments);
    }

    if (req.method === 'POST') {
      console.log('Creating new payment:', req.body);
      
      const paymentData = {
        ...req.body,
        dueDate: new Date(req.body.dueDate),
        paidDate: req.body.paidDate ? new Date(req.body.paidDate) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await paymentsCollection.insertOne(paymentData);
      console.log('Payment created with ID:', result.insertedId);
      
      const newPayment = await paymentsCollection.findOne({ _id: result.insertedId });
      
      const responsePayment = {
        ...newPayment,
        id: newPayment._id.toString(),
        _id: undefined
      };

      return res.status(201).json(responsePayment);
    }

    if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Payment ID is required for updates' });
      }

      console.log('Updating payment:', id);

      const { ObjectId } = await import('mongodb');
      const updateDoc = {
        ...updateData,
        updatedAt: new Date()
      };

      if (updateData.paidDate) {
        updateDoc.paidDate = new Date(updateData.paidDate);
      }

      await paymentsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateDoc }
      );

      const updatedPayment = await paymentsCollection.findOne({ _id: new ObjectId(id) });
      
      const responsePayment = {
        ...updatedPayment,
        id: updatedPayment._id.toString(),
        _id: undefined
      };

      return res.status(200).json(responsePayment);
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
  
  const samplePayments = [];

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

  return res.status(405).json({ error: 'Method not allowed' });
}