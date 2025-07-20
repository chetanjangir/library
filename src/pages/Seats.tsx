import React, { useState } from 'react';
import SeatMap from '../components/seats/SeatMap';
import type { Seat, Student } from '../types';

// Generate 100 seats with sample data
const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  
  for (let i = 1; i <= 100; i++) {
    const random = Math.random();
    
    if (random < 0.3) {
      // 30% vacant seats
      seats.push({
        id: i,
        isOccupied: false,
        type: 'vacant'
      });
    } else if (random < 0.6) {
      // 30% full day occupied
      seats.push({
        id: i,
        isOccupied: true,
        type: 'full',
        student: {
          id: `student-${i}`,
          name: `Student ${i}`,
          email: `student${i}@example.com`,
          mobile: `+123456789${i}`,
          joinDate: '2023-11-01',
          planType: 'monthly',
          dayType: 'full',
          status: 'active',
          seatNumber: i,
          subscriptionEndDate: '2024-01-15',
          currency: 'USD',
          monthlyAmount: 100,
          halfDayAmount: 60,
          fullDayAmount: 100
        }
      });
    } else {
      // 40% half day shared
      seats.push({
        id: i,
        isOccupied: true,
        type: 'half-shared',
        halfDayStudents: {
          morning: {
            id: `student-${i}-m`,
            name: `Morning Student ${i}`,
            email: `morning${i}@example.com`,
            mobile: `+123456789${i}`,
            joinDate: '2023-11-01',
            planType: 'monthly',
            dayType: 'half',
            halfDaySlot: 'morning',
            status: 'active',
            seatNumber: i,
            subscriptionEndDate: '2024-01-15',
            currency: 'USD',
            monthlyAmount: 100,
            halfDayAmount: 60,
            fullDayAmount: 100
          },
          evening: Math.random() > 0.3 ? {
            id: `student-${i}-e`,
            name: `Evening Student ${i}`,
            email: `evening${i}@example.com`,
            mobile: `+123456789${i}`,
            joinDate: '2023-11-01',
            planType: 'monthly',
            dayType: 'half',
            halfDaySlot: 'evening',
            status: 'active',
            seatNumber: i,
            subscriptionEndDate: '2024-01-15',
            currency: 'USD',
            monthlyAmount: 100,
            halfDayAmount: 60,
            fullDayAmount: 100
          } : undefined
        }
      });
    }
  }
  
  return seats;
};

function Seats() {
  const [seats] = useState<Seat[]>(generateSeats());
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  const handleSeatClick = (seatId: number) => {
    const seat = seats.find(s => s.id === seatId);
    setSelectedSeat(seat || null);
  };

  const vacantSeats = seats.filter(s => !s.isOccupied).length;
  const occupiedSeats = seats.filter(s => s.isOccupied).length;
  const halfDaySeats = seats.filter(s => s.type === 'half-shared').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Seat Management</h1>
        <div className="text-sm text-gray-600">
          Total: 100 | Occupied: {occupiedSeats} | Vacant: {vacantSeats}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SeatMap seats={seats} onSeatClick={handleSeatClick} />
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