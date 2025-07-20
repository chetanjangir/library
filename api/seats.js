export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const seats = [];
    for (let i = 1; i <= 100; i++) {
      seats.push({
        id: i,
        seatNumber: i,
        isOccupied: false,
        type: 'vacant'
      });
    }

    return res.status(200).json(seats);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}