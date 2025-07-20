import React from 'react';
import { User, Users } from 'lucide-react';
import type { Seat, Student } from '../../types';

interface SeatMapProps {
  seats: Seat[];
  onSeatClick: (seatId: number) => void;
}

function SeatMap({ seats, onSeatClick }: SeatMapProps) {
  const getSeatColor = (seat: Seat) => {
    if (!seat.isOccupied) return 'bg-green-100 border-green-300 hover:bg-green-200';
    if (seat.type === 'half-shared') return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200';
    return 'bg-red-100 border-red-300 hover:bg-red-200';
  };

  const getSeatIcon = (seat: Seat) => {
    if (!seat.isOccupied) return null;
    if (seat.type === 'half-shared') return <Users className="w-4 h-4" />;
    return <User className="w-4 h-4" />;
  };

  const getSeatTooltip = (seat: Seat) => {
    if (!seat.isOccupied) return 'Vacant';
    if (seat.type === 'half-shared' && seat.halfDayStudents) {
      const morning = seat.halfDayStudents.morning?.name || 'Empty';
      const evening = seat.halfDayStudents.evening?.name || 'Empty';
      return `Morning: ${morning}\nEvening: ${evening}`;
    }
    return seat.student?.name || 'Occupied';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Seat Map (100 Seats)</h2>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
            <span>Vacant ({seats.filter(s => !s.isOccupied).length})</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
            <span>Half Day ({seats.filter(s => s.type === 'half-shared').length})</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
            <span>Full Day ({seats.filter(s => s.type === 'full' && s.isOccupied).length})</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1 sm:gap-2">
        {seats.map((seat) => (
          <div
            key={seat.id}
            className={`
              relative aspect-square border-2 rounded cursor-pointer transition-colors
              flex items-center justify-center text-xs font-medium min-h-[40px] sm:min-h-[50px]
              ${getSeatColor(seat)}
            `}
            onClick={() => onSeatClick(seat.id)}
            title={getSeatTooltip(seat)}
          >
            <div className="text-center">
              <div className="flex justify-center mb-0.5 sm:mb-1">
                {getSeatIcon(seat)}
              </div>
              <div className="text-xs">{seat.id}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-2 sm:mt-4 text-xs text-gray-500">
        Click on any seat to view details or assign a student
      </div>
    </div>
  );
}

export default SeatMap;