/*
  # Repair Management System Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `role` (text) - either 'technician' or 'admin'
      - `created_at` (timestamp)
    
    - `spare_parts`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `quantity` (integer)
      - `price` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `repair_logs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `status` (text) - 'pending', 'in_progress', 'completed'
      - `priority` (text) - 'low', 'medium', 'high'
      - `technician_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `repair_history`
      - `id` (uuid, primary key)
      - `repair_log_id` (uuid, foreign key)
      - `action` (text)
      - `notes` (text)
      - `performed_by` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `repair_parts`
      - `id` (uuid, primary key)
      - `repair_log_id` (uuid, foreign key)
      - `spare_part_id` (uuid, foreign key)
      - `quantity_used` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('technician', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Spare parts table
CREATE TABLE IF NOT EXISTS spare_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  quantity integer NOT NULL DEFAULT 0,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Repair logs table
CREATE TABLE IF NOT EXISTS repair_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  technician_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Repair history table
CREATE TABLE IF NOT EXISTS repair_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_log_id uuid REFERENCES repair_logs(id),
  action text NOT NULL,
  notes text,
  performed_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Repair parts table
CREATE TABLE IF NOT EXISTS repair_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_log_id uuid REFERENCES repair_logs(id),
  spare_part_id uuid REFERENCES spare_parts(id),
  quantity_used integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_parts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all spare parts"
  ON spare_parts
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

CREATE POLICY "Technicians can view spare parts"
  ON spare_parts
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'technician'
  ));

CREATE POLICY "Users can view assigned repair logs"
  ON repair_logs
  FOR SELECT
  TO authenticated
  USING (
    technician_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage repair logs"
  ON repair_logs
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

CREATE POLICY "Users can view repair history"
  ON repair_history
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM repair_logs
    WHERE repair_logs.id = repair_history.repair_log_id
    AND (repair_logs.technician_id = auth.uid() OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    ))
  ));

CREATE POLICY "Users can view repair parts"
  ON repair_parts
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM repair_logs
    WHERE repair_logs.id = repair_parts.repair_log_id
    AND (repair_logs.technician_id = auth.uid() OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    ))
  ));