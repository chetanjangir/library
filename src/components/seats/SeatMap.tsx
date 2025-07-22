import React from 'react';
import { User, Users, Plus } from 'lucide-react';
import type { Seat, Student } from '../../types';

interface SeatMapProps {
  seats: Seat[];
  onSeatClick: (seatId: number) => void;
  onAddStudent?: (seatNumber: number) => void;
  onRefresh?: () => void;
}

function SeatMap({ seats, onSeatClick, onAddStudent, onRefresh }: SeatMapProps) {
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
      return `Morning: ${morning} | Evening: ${evening}`;
    }
    return seat.student?.name || 'Occupied';
  };

  const handleSeatClick = (seat: Seat) => {
    if (!seat.isOccupied && onAddStudent) {
      // For vacant seats, show option to add student
      const shouldAdd = confirm(`Add a new student to Seat ${seat.id}?`);
      if (shouldAdd) {
        onAddStudent(seat.id);
      }
    } else {
      // For occupied seats, show details
      onSeatClick(seat.id);
    }
  };

  const getSeatDetails = (seat: Seat) => {
    if (!seat.isOccupied) return null;
    
    if (seat.type === 'full' && seat.student) {
      return (
        <div className="text-[8px] text-gray-600 truncate max-w-[30px] mt-0.5">
          {seat.student.name.split(' ')[0]}
        </div>
      );
    }
    
    if (seat.type === 'half-shared' && seat.halfDayStudents) {
      return (
        <div className="text-[7px] text-gray-600 text-center mt-0.5">
          <div className="truncate max-w-[30px]">
            M: {seat.halfDayStudents.morning?.name?.split(' ')[0] || 'Empty'}
          </div>
          <div className="truncate max-w-[30px]">
            E: {seat.halfDayStudents.evening?.name?.split(' ')[0] || 'Empty'}
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Seat Map (100 Seats)</h2>
        <button 
          onClick={onRefresh}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-4">
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
              relative aspect-square border-2 rounded cursor-pointer transition-all duration-200 hover:scale-105
              flex items-center justify-center text-xs font-medium min-h-[40px] sm:min-h-[50px]
              ${getSeatColor(seat)}
            `}
            onClick={() => handleSeatClick(seat)}
            title={getSeatTooltip(seat)}
          >
            <div className="text-center">
              <div className="flex justify-center mb-0.5 sm:mb-1 relative">
                {!seat.isOccupied ? (
                  <div className="opacity-0 hover:opacity-100 transition-opacity absolute -top-1 -right-1">
                    <Plus className="w-3 h-3 text-green-600 bg-white rounded-full border border-green-600" />
                  </div>
                ) : (
                  getSeatIcon(seat)
                )}
              </div>
              <div className="text-xs">{seat.id}</div>
              {getSeatDetails(seat)}
            </div>
            
            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap max-w-48">
              {getSeatTooltip(seat)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-2 sm:mt-4 text-xs text-gray-500">
        Click on vacant seats (green) to add students • Click on occupied seats to view details
      </div>
    </div>
  );
}

export default SeatMap;