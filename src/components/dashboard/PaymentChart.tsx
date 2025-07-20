import React from 'react';
import { BarChart, Ban as Bar } from 'lucide-react';

function PaymentChart() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const maxHeight = 150;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Trends</h2>
      <div className="flex items-end space-x-8 h-[200px]">
        {months.map((month, index) => {
          const height = Math.floor(Math.random() * (maxHeight - 50) + 50);
          return (
            <div key={month} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-indigo-100 rounded-t"
                style={{ height: `${height}px` }}
              >
                <div 
                  className="w-full bg-indigo-600 rounded-t transition-all duration-300 hover:bg-indigo-700"
                  style={{ height: `${height * 0.7}px` }}
                />
              </div>
              <span className="mt-2 text-sm text-gray-600">{month}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center text-sm text-gray-600">
        <BarChart className="w-4 h-4 mr-2" />
        <span>Monthly payment collection</span>
      </div>
    </div>
  );
}

export default PaymentChart