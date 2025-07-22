import React, { useState } from 'react';
import SeatMap from '../components/seats/SeatMap';
import { apiService } from '../services/api';
import type { Seat, Student } from '../types';

// Generate 100 vacant seats as fallback
const generateVacantSeats = (): Seat[] => {
  const seats: Seat[] = [];
  
  for (let i = 1; i <= 100; i++) {
    seats.push({
      id: i,
      isOccupied: false,
      type: 'vacant'
    });
  }
  
  return seats;
};

function Seats() {
  const [seats, setSeats] = useState<Seat[]>(generateVacantSeats());
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load seats on component mount
  React.useEffect(() => {
    loadSeats();
  }, []);

  const loadSeats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSeats();
      setSeats(data);
    } catch (err) {
      setError('Failed to load seats. Using default vacant seats.');
      console.error('Error loading seats:', err);
      // Keep the vacant seats as fallback
      setSeats(generateVacantSeats());
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatId: number) => {
    const seat = seats.find(s => s.id === seatId);
    setSelectedSeat(seat || null);
  };

  const handleAddStudent = (seatNumber: number) => {
    // Navigate to students page with seat number pre-filled
    window.location.href = `/students?seat=${seatNumber}`;
  };
  const vacantSeats = seats.filter(s => !s.isOccupied).length;
  const occupiedSeats = seats.filter(s => s.isOccupied).length;
  const halfDaySeats = seats.filter(s => s.type === 'half-shared').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading seats...</div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Seat Management</h1>
        <div className="text-sm text-gray-600">
          Total: 100 | Occupied: {occupiedSeats} | Vacant: {vacantSeats}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SeatMap 
            seats={seats} 
            onSeatClick={handleSeatClick} 
            onAddStudent={handleAddStudent}
            onRefresh={loadSeats} 
          />
        </div>
        
        <div className="space-y-6">
          {/* Seat Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Seat Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Seats:</span>
                <span className="font-medium">100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Occupied:</span>
                <span className="font-medium text-red-600">{occupiedSeats}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vacant:</span>
                <span className="font-medium text-green-600">{vacantSeats}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Half Day Shared:</span>
                <span className="font-medium text-yellow-600">{halfDaySeats}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Occupancy Rate:</span>
                <span className="font-medium">{Math.round((occupiedSeats / 100) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Selected Seat Details */}
          {selectedSeat && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Seat {selectedSeat.id} Details
              </h3>
              
              {!selectedSeat.isOccupied ? (
                <div className="text-center py-4">
                  <div className="text-green-600 font-medium">Vacant Seat</div>
                  <p className="text-sm text-gray-500 mt-2">
                    This seat is available for allocation
                  </p>
                  <button
                    onClick={() => handleAddStudent(selectedSeat.id)}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add Student to This Seat
                  </button>
                </div>
              ) : selectedSeat.type === 'full' && selectedSeat.student ? (
                <div className="space-y-3">
                  <div className="text-red-600 font-medium">Full Day Occupied</div>
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-gray-900">{selectedSeat.student.name}</h4>
                    <p className="text-sm text-gray-600">{selectedSeat.student.email}</p>
                    <p className="text-sm text-gray-600">{selectedSeat.student.mobile}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {selectedSeat.student.planType} - {selectedSeat.student.dayType} day
                    </p>
                  </div>
                </div>
              ) : selectedSeat.type === 'half-shared' && selectedSeat.halfDayStudents ? (
                <div className="space-y-4">
                  <div className="text-yellow-600 font-medium">Half Day Shared</div>
                  
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-gray-700 mb-2">Morning Slot (9 AM - 2 PM)</h4>
                    {selectedSeat.halfDayStudents.morning ? (
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="font-medium">{selectedSeat.halfDayStudents.morning.name}</p>
                        <p className="text-sm text-gray-600">{selectedSeat.halfDayStudents.morning.email}</p>
                        <p className="text-sm text-gray-600">{selectedSeat.halfDayStudents.morning.mobile}</p>
                      </div>
                    ) : (
                      <div className="bg-green-50 p-3 rounded text-green-700">
                        Available
                        <button
                          onClick={() => handleAddStudent(selectedSeat.id)}
                          className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Add Student
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Evening Slot (2 PM - 9 PM)</h4>
                    {selectedSeat.halfDayStudents.evening ? (
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="font-medium">{selectedSeat.halfDayStudents.evening.name}</p>
                        <p className="text-sm text-gray-600">{selectedSeat.halfDayStudents.evening.email}</p>
                        <p className="text-sm text-gray-600">{selectedSeat.halfDayStudents.evening.mobile}</p>
                      </div>
                    ) : (
                      <div className="bg-green-50 p-3 rounded text-green-700">
                        Available
                        <button
                          onClick={() => handleAddStudent(selectedSeat.id)}
                          className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Add Student
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Seats;