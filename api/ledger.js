import clientPromise from '../lib/mongodb.js';

// Flattened, paginated view of every student's payment ledger
// (student.paymentHistory, stored as payment_history on the document). This
// is the same data the Students form / "Record Payment" write to, so unlike
// the old standalone `payments` collection it can never drift out of sync -
// there is only one place a payment or advance is ever recorded.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.MONGODB_URI) {
      console.log('No MongoDB URI found, using fallback data for ledger API');
      return handleFallback(req, res);
    }

    const client = await clientPromise;
    const db = client.db('library_management');
    const collection = db.collection('students');

    const query = req.query || {};
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(query.limit) || 20));

    const pipeline = [
      { $match: { payment_history: { $exists: true, $ne: [] } } },
      { $unwind: '$payment_history' },
      {
        $project: {
          _id: 0,
          studentId: { $toString: '$_id' },
          studentName: '$name',
          seatNumber: { $ifNull: ['$seat_number', null] },
          currency: { $ifNull: ['$currency', 'INR'] },
          entryId: '$payment_history.id',
          date: '$payment_history.date',
          amount: '$payment_history.amount',
          type: '$payment_history.type',
          note: { $ifNull: ['$payment_history.note', null] }
        }
      }
    ];

    const postFilter = {};
    if (query.search) {
      const escaped = String(query.search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (escaped) postFilter.studentName = new RegExp(escaped, 'i');
    }
    if (query.type && query.type !== 'all') {
      postFilter.type = query.type;
    }
    if (query.dateFrom || query.dateTo) {
      postFilter.date = {};
      if (query.dateFrom) postFilter.date.$gte = String(query.dateFrom);
      if (query.dateTo) postFilter.date.$lte = `${query.dateTo}T23:59:59.999Z`;
    }
    if (Object.keys(postFilter).length > 0) {
      pipeline.push({ $match: postFilter });
    }
    pipeline.push({ $sort: { date: -1 } });

    const countPipeline = [...pipeline, { $count: 'total' }];
    const dataPipeline = [...pipeline, { $skip: (page - 1) * limit }, { $limit: limit }];

    const [countResult, entries] = await Promise.all([
      collection.aggregate(countPipeline).toArray(),
      collection.aggregate(dataPipeline).toArray()
    ]);

    const total = (countResult[0] && countResult[0].total) || 0;

    return res.status(200).json({
      entries: entries.map(e => ({ ...e, id: `${e.studentId}-${e.entryId}` })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (error) {
    console.error('Ledger API Error:', error);
    return handleFallback(req, res);
  }
}

function handleFallback(req, res) {
  const page = Math.max(1, parseInt(req.query?.page) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(req.query?.limit) || 20));
  return res.status(200).json({
    entries: [],
    pagination: { page, limit, total: 0, totalPages: 1 }
  });
}
