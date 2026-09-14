import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import type { Student } from '../../types';
import { computeDueInfo } from '../../utils/dues';

interface PaymentCollectionCardProps {
  students: Student[];
}

/** Ring showing collected vs outstanding, derived live from each student's payment ledger. */
function PaymentCollectionCard({ students }: PaymentCollectionCardProps) {
  const collected = students.reduce((sum, s) => sum + computeDueInfo(s).totalPaid, 0);
  const outstanding = students
    .filter(s => s.status !== 'inactive')
    .reduce((sum, s) => sum + computeDueInfo(s).due, 0);

  const total = collected + outstanding;
  const pct = total > 0 ? Math.round((collected / total) * 100) : 100;

  const data = total > 0
    ? [{ name: 'Collected', value: collected }, { name: 'Outstanding', value: outstanding }]
    : [{ name: 'Collected', value: 1 }];

  const colors = total > 0 ? ['#4f46e5', '#e5e7eb'] : ['#e5e7eb'];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
      <div className="mb-2">
        <h2 className="text-base font-semibold text-gray-900">Payment Collection</h2>
        <p className="text-sm text-gray-500">Current standing</p>
      </div>

      <div className="relative flex-1 flex items-center justify-center min-h-[176px]">
        <PieChart width={200} height={200}>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={70}
            outerRadius={92}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index]} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-gray-900">{pct}%</span>
          <span className="text-xs text-gray-500">collected</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-center">
          <p className="text-xs text-gray-500">Collected</p>
          <p className="text-sm font-semibold text-gray-900">₹{collected.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-center">
          <p className="text-xs text-gray-500">Outstanding</p>
          <p className="text-sm font-semibold text-gray-900">₹{outstanding.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export default PaymentCollectionCard;
