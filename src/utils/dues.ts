import type { PaymentRecord, Student } from '../types';

export interface DueInfo {
  cycleAmount: number;
  monthsElapsed: number;
  expectedTotal: number;
  totalPaid: number;
  due: number;
  advance: number;
}

type DueStudent = Pick<
  Student,
  'dayType' | 'halfDayAmount' | 'fullDayAmount' | 'monthlyAmount' | 'planType' | 'startDate' | 'joinDate' | 'paymentHistory' | 'paidAmount'
>;

/** The amount owed for a single billing cycle (one month for monthly plans, the plan amount otherwise). */
export function getCycleAmount(student: Pick<Student, 'dayType' | 'halfDayAmount' | 'fullDayAmount' | 'monthlyAmount'>): number {
  const monthly = student.monthlyAmount || 0;
  if (student.dayType === 'half') {
    return student.halfDayAmount || monthly * 0.6;
  }
  return student.fullDayAmount || monthly;
}

/**
 * Number of monthly billing cycles a student owes for, counting the month they
 * joined as cycle 1 and adding one for every full calendar month since.
 * Daily/yearly plans are treated as a single cycle (the app doesn't model
 * recurring daily/yearly billing).
 */
export function getMonthsElapsed(
  student: Pick<Student, 'planType' | 'startDate' | 'joinDate'>,
  asOf: Date = new Date()
): number {
  if (student.planType !== 'monthly') return 1;

  const startRaw = student.startDate || student.joinDate;
  if (!startRaw) return 1;

  const start = new Date(startRaw);
  if (isNaN(start.getTime()) || start > asOf) return 1;

  const months = (asOf.getFullYear() - start.getFullYear()) * 12 + (asOf.getMonth() - start.getMonth()) + 1;
  return Math.max(1, months);
}

/** Total amount ever received from the student, from their payment ledger. */
export function getTotalPaid(student: Pick<Student, 'paymentHistory' | 'paidAmount'>): number {
  if (student.paymentHistory && student.paymentHistory.length > 0) {
    return student.paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0);
  }
  // Legacy students created before the payment ledger existed
  return student.paidAmount || 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Computes how much a student owes (or how much credit/advance they carry) as of a given date. */
export function computeDueInfo(student: DueStudent, asOf: Date = new Date()): DueInfo {
  const cycleAmount = getCycleAmount(student);
  const monthsElapsed = getMonthsElapsed(student, asOf);
  const expectedTotal = round2(monthsElapsed * cycleAmount);
  const totalPaid = round2(getTotalPaid(student));
  const due = Math.max(0, round2(expectedTotal - totalPaid));
  const advance = Math.max(0, round2(totalPaid - expectedTotal));

  return { cycleAmount, monthsElapsed, expectedTotal, totalPaid, due, advance };
}

/** Builds a new payment ledger entry. */
export function makePaymentRecord(amount: number, type: PaymentRecord['type'] = 'payment', note?: string): PaymentRecord {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    amount,
    type,
    note
  };
}

/** Derives the legacy paidAmount/balanceAmount/paymentStatus trio from a payment ledger. */
export function derivePaymentFields(student: DueStudent, asOf: Date = new Date()) {
  const info = computeDueInfo(student, asOf);
  const paymentStatus: 'paid' | 'due' | 'partial' = info.due <= 0 ? 'paid' : info.totalPaid > 0 ? 'partial' : 'due';
  return {
    paidAmount: info.totalPaid,
    balanceAmount: info.due,
    paymentStatus
  };
}
