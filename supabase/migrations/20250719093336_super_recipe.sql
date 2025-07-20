-- Students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  join_date TIMESTAMP DEFAULT NOW(),
  plan_type VARCHAR(20) CHECK (plan_type IN ('daily', 'monthly', 'yearly')) NOT NULL,
  day_type VARCHAR(10) CHECK (day_type IN ('full', 'half')) NOT NULL,
  half_day_slot VARCHAR(10) CHECK (half_day_slot IN ('morning', 'evening')),
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'expired')) DEFAULT 'active',
  seat_number INTEGER,
  subscription_end_date TIMESTAMP NOT NULL,
  currency VARCHAR(3) CHECK (currency IN ('USD', 'EUR', 'INR', 'GBP')) DEFAULT 'USD',
  monthly_amount DECIMAL(10,2) NOT NULL,
  half_day_amount DECIMAL(10,2) NOT NULL,
  full_day_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) CHECK (currency IN ('USD', 'EUR', 'INR', 'GBP')) DEFAULT 'USD',
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) CHECK (status IN ('paid', 'pending', 'overdue')) DEFAULT 'pending',
  plan_type VARCHAR(20) CHECK (plan_type IN ('daily', 'monthly', 'yearly')) NOT NULL,
  day_type VARCHAR(10) CHECK (day_type IN ('full', 'half')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seats table
CREATE TABLE seats (
  id INTEGER PRIMARY KEY,
  is_occupied BOOLEAN DEFAULT FALSE,
  seat_type VARCHAR(20) CHECK (seat_type IN ('full', 'half-shared', 'vacant')) DEFAULT 'vacant',
  full_day_student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  morning_student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  evening_student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert 100 seats
INSERT INTO seats (id) 
SELECT generate_series(1, 100);

-- Indexes for better performance
CREATE INDEX idx_students_seat_number ON students(seat_number);
CREATE INDEX idx_students_subscription_end ON students(subscription_end_date);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_status ON payments(status);