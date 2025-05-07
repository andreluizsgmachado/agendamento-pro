-- Create schedules table for available time slots
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  duration_minutes integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table for booked slots
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id uuid REFERENCES schedules(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for schedules
CREATE POLICY "Users can view own schedules"
  ON schedules
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules"
  ON schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules"
  ON schedules
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules"
  ON schedules
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for appointments
CREATE POLICY "Users can view own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM schedules
    WHERE schedules.id = appointments.schedule_id
    AND schedules.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM schedules
    WHERE schedules.id = appointments.schedule_id
    AND schedules.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM schedules
    WHERE schedules.id = appointments.schedule_id
    AND schedules.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM schedules
    WHERE schedules.id = appointments.schedule_id
    AND schedules.user_id = auth.uid()
  ));

-- Allow public to view available schedules
CREATE POLICY "Public can view active schedules"
  ON schedules
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Allow public to create appointments
CREATE POLICY "Public can create appointments"
  ON appointments
  FOR INSERT
  TO anon
  WITH CHECK (EXISTS (
    SELECT 1 FROM schedules
    WHERE schedules.id = appointments.schedule_id
    AND schedules.is_active = true
  )); 