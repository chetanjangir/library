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
      
      // Update student status based on subscription end date
      const now = new Date();
      for (const student of students) {
        const endDate = new Date(student.subscription_end_date);
        let newStatus = student.status;
        
        if (endDate < now) {
          newStatus = 'expired';
        } else if (student.status === 'expired' && endDate > now) {
          newStatus = 'active';
        }
        
        // Update status in database if changed
        if (newStatus !== student.status) {
          await collection.updateOne(
            { _id: student._id },
            { $set: { status: newStatus, updated_at: new Date() } }
          );
          student.status = newStatus;
        }
      }
      
      const responseStudents = students.map(student => ({
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        mobile: student.mobile,
        biometricId: student.biometric_id,
        joinDate: student.join_date ? student.join_date.toISOString() : student.joinDate,
        startDate: student.start_date ? student.start_date.toISOString() : (student.join_date ? student.join_date.toISOString() : student.joinDate),
        endDate: student.end_date,
        planType: student.plan_type || student.planType,
        dayType: student.day_type || student.dayType,
        halfDaySlot: student.half_day_slot || student.halfDaySlot,
        status: student.status,
        seatNumber: student.seat_number || student.seatNumber,
        subscriptionEndDate: student.subscription_end_date ? student.subscription_end_date.toISOString() : student.subscriptionEndDate,
        currency: student.currency,
        monthlyAmount: student.monthly_amount || student.monthlyAmount,
        halfDayAmount: student.half_day_amount || student.halfDayAmount,
        fullDayAmount: student.full_day_amount || student.fullDayAmount,
        paymentStatus: student.payment_status || student.paymentStatus || 'due',
        paidAmount: student.paid_amount || student.paidAmount || 0,
        balanceAmount: student.balance_amount || student.balanceAmount || 0,
        _id: undefined
      }));
      
      console.log(`Returning ${responseStudents.length} students with proper date formatting`);
      return res.status(200).json(responseStudents);
    }

    if (req.method === 'POST') {
      console.log('Creating new student:', req.body.name);
      
      const studentData = {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        biometric_id: req.body.biometricId,
        join_date: new Date(req.body.startDate || req.body.joinDate || new Date()),
        start_date: new Date(req.body.startDate || req.body.joinDate || new Date()),
        end_date: req.body.endDate ? new Date(req.body.endDate) : null,
        plan_type: req.body.planType,
        day_type: req.body.dayType,
        half_day_slot: req.body.halfDaySlot,
        status: req.body.status || 'active',
        seat_number: req.body.seatNumber,
        subscription_end_date: new Date(req.body.subscriptionEndDate),
        currency: req.body.currency,
        monthly_amount: req.body.monthlyAmount,
        half_day_amount: req.body.halfDayAmount,
        full_day_amount: req.body.fullDayAmount,
        payment_status: req.body.paymentStatus || 'due',
        paid_amount: req.body.paidAmount || 0,
        balance_amount: req.body.balanceAmount || 0,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Check if seat is already occupied (if seat number provided)
      if (studentData.seat_number) {
        const existingSeat = await collection.findOne({ 
          seat_number: studentData.seat_number, 
          status: { $in: ['active', 'expired'] }
        });
        
        if (existingSeat) {
          // For half day, check if slot is available
          if (studentData.day_type === 'half') {
            const sameSlot = await collection.findOne({
              seat_number: studentData.seat_number,
              day_type: 'half',
              half_day_slot: studentData.half_day_slot,
              status: { $in: ['active', 'expired'] }
            });
            
            if (sameSlot) {
              return res.status(400).json({ 
                error: `Seat ${studentData.seat_number} ${studentData.half_day_slot} slot is already occupied` 
              });
            }
          } else {
            // Full day seat is occupied
            return res.status(400).json({ 
              error: `Seat ${studentData.seat_number} is already occupied` 
            });
          }
        }
      }
      const result = await collection.insertOne(studentData);
      console.log('Student created with ID:', result.insertedId);
      
      const newStudent = await collection.findOne({ _id: result.insertedId });
      
      const responseStudent = {
        id: newStudent._id.toString(),
        name: newStudent.name,
        email: newStudent.email,
        mobile: newStudent.mobile,
        joinDate: newStudent.join_date,
        startDate: newStudent.start_date,
        endDate: newStudent.end_date,
        planType: newStudent.plan_type,
        dayType: newStudent.day_type,
        halfDaySlot: newStudent.half_day_slot,
        status: newStudent.status,
        seatNumber: newStudent.seat_number,
        subscriptionEndDate: newStudent.subscription_end_date,
        currency: newStudent.currency,
        monthlyAmount: newStudent.monthly_amount,
        halfDayAmount: newStudent.half_day_amount,
        fullDayAmount: newStudent.full_day_amount,
        paymentStatus: newStudent.payment_status,
        paidAmount: newStudent.paid_amount,
        balanceAmount: newStudent.balance_amount,
        _id: undefined
      };

      // Log WhatsApp message (simulated)
      if (newStudent.mobile) {
        console.log(`WhatsApp message would be sent to ${newStudent.mobile}:`);
        console.log(`Welcome ${newStudent.name}! Your seat ${newStudent.seat_number || 'TBD'} is ready. WiFi: LibraryWiFi, Password: library123`);
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
      
      // Get current student data
      const currentStudent = await collection.findOne({ _id: new ObjectId(id) });
      if (!currentStudent) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      // Check seat availability if seat number is being changed
      if (updateData.seatNumber && updateData.seatNumber !== currentStudent.seat_number) {
        const existingSeat = await collection.findOne({ 
          seat_number: updateData.seatNumber, 
          status: { $in: ['active', 'expired'] },
          _id: { $ne: new ObjectId(id) }
        });
        
        if (existingSeat) {
          if (updateData.dayType === 'half') {
            const sameSlot = await collection.findOne({
              seat_number: updateData.seatNumber,
              day_type: 'half',
              half_day_slot: updateData.halfDaySlot,
              status: { $in: ['active', 'expired'] },
              _id: { $ne: new ObjectId(id) }
            });
            
            if (sameSlot) {
              return res.status(400).json({ 
                error: `Seat ${updateData.seatNumber} ${updateData.halfDaySlot} slot is already occupied` 
              });
            }
          } else {
            return res.status(400).json({ 
              error: `Seat ${updateData.seatNumber} is already occupied` 
            });
          }
        }
      }
      
      const updateDoc = {
        name: updateData.name,
        email: updateData.email,
        mobile: updateData.mobile,
        biometric_id: updateData.biometricId,
        start_date: updateData.startDate ? new Date(updateData.startDate) : undefined,
        end_date: updateData.endDate ? new Date(updateData.endDate) : null,
        plan_type: updateData.planType,
        day_type: updateData.dayType,
        half_day_slot: updateData.halfDaySlot,
        status: updateData.status,
        seat_number: updateData.seatNumber || null,
        subscription_end_date: new Date(updateData.subscriptionEndDate),
        currency: updateData.currency,
        monthly_amount: updateData.monthlyAmount,
        half_day_amount: updateData.halfDayAmount,
        full_day_amount: updateData.fullDayAmount,
        payment_status: updateData.paymentStatus,
        paid_amount: updateData.paidAmount,
        balance_amount: updateData.balanceAmount,
        updated_at: new Date()
      };

      // Remove undefined values
      Object.keys(updateDoc).forEach(key => {
        if (updateDoc[key] === undefined) {
          delete updateDoc[key];
        }
      });
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateDoc }
      );

      const updatedStudent = await collection.findOne({ _id: new ObjectId(id) });
      
      const responseStudent = {
        id: updatedStudent._id.toString(),
        name: updatedStudent.name,
        email: updatedStudent.email,
        mobile: updatedStudent.mobile,
        biometricId: updatedStudent.biometric_id,
        joinDate: updatedStudent.join_date,
        startDate: updatedStudent.start_date,
        endDate: updatedStudent.end_date,
        planType: updatedStudent.plan_type,
        dayType: updatedStudent.day_type,
        halfDaySlot: updatedStudent.half_day_slot,
        status: updatedStudent.status,
        seatNumber: updatedStudent.seat_number,
        subscriptionEndDate: updatedStudent.subscription_end_date,
        currency: updatedStudent.currency,
        monthlyAmount: updatedStudent.monthly_amount,
        halfDayAmount: updatedStudent.half_day_amount,
        fullDayAmount: updatedStudent.full_day_amount,
        paymentStatus: updatedStudent.payment_status,
        paidAmount: updatedStudent.paid_amount,
        balanceAmount: updatedStudent.balance_amount,
        _id: undefined
      };

      return res.status(200).json(responseStudent);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Student ID is required for deletion' });
      }

      console.log('Deleting student:', id);
      const { ObjectId } = await import('mongodb');
      
      // Get student data before deletion for logging
      const studentToDelete = await collection.findOne({ _id: new ObjectId(id) });
      if (!studentToDelete) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      await collection.deleteOne({ _id: new ObjectId(id) });
      
      console.log(`Student ${studentToDelete.name} deleted, seat ${studentToDelete.seat_number} is now vacant`);
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