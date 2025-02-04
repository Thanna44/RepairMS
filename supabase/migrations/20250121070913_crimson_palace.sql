/*
  # Add mock data for repair logs

  1. Mock Data
    - Adds sample repair logs with different statuses and priorities
    - Adds corresponding repair history entries
    - Uses realistic repair scenarios and descriptions
*/

-- Insert mock users first (technicians)
INSERT INTO users (id, email, full_name, role)
VALUES
  ('d8c7d961-b7c2-4e3c-a1f0-6390cc8d9674', 'john.smith@repair.com', 'John Smith', 'technician'),
  ('f6a7c492-d123-4f9a-b8e1-9b9d8c7a6b5e', 'sarah.jones@repair.com', 'Sarah Jones', 'technician')
ON CONFLICT (email) DO NOTHING;

-- Insert mock repair logs
INSERT INTO repair_logs (id, title, description, status, priority, technician_id, created_at)
VALUES
  (
    'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
    'Printer Paper Jam Issue',
    'HP LaserJet experiencing frequent paper jams. Requires roller cleaning and potential replacement.',
    'in_progress',
    'medium',
    'd8c7d961-b7c2-4e3c-a1f0-6390cc8d9674',
    NOW() - INTERVAL '2 days'
  ),
  (
    'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a',
    'Network Switch Failure',
    'Main office switch showing intermittent connectivity issues. Needs diagnostic and possible replacement.',
    'pending',
    'high',
    'f6a7c492-d123-4f9a-b8e1-9b9d8c7a6b5e',
    NOW() - INTERVAL '1 day'
  ),
  (
    'c3d4e5f6-a7b8-6543-8765-3c4d5e6f7a8b',
    'Monitor Calibration',
    'Design department monitors requiring color calibration and firmware updates.',
    'completed',
    'low',
    'd8c7d961-b7c2-4e3c-a1f0-6390cc8d9674',
    NOW() - INTERVAL '5 days'
  ),
  (
    'd4e5f6a7-b8c9-7654-8765-4d5e6f7a8b9c',
    'Server Cooling System',
    'Server room cooling system showing error codes. Emergency inspection required.',
    'in_progress',
    'high',
    'f6a7c492-d123-4f9a-b8e1-9b9d8c7a6b5e',
    NOW() - INTERVAL '6 hours'
  ),
  (
    'e5f6a7b8-c9d0-8765-8765-5e6f7a8b9c0d',
    'UPS Battery Replacement',
    'Scheduled UPS battery replacement for accounting department workstations.',
    'pending',
    'medium',
    'd8c7d961-b7c2-4e3c-a1f0-6390cc8d9674',
    NOW() - INTERVAL '12 hours'
  );

-- Insert corresponding repair history entries
INSERT INTO repair_history (repair_log_id, action, notes, performed_by, created_at)
VALUES
  (
    'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
    'Started inspection',
    'Initial assessment shows worn out paper pickup rollers',
    'd8c7d961-b7c2-4e3c-a1f0-6390cc8d9674',
    NOW() - INTERVAL '2 days'
  ),
  (
    'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a',
    'Created ticket',
    'Urgent: Multiple departments affected by network issues',
    'f6a7c492-d123-4f9a-b8e1-9b9d8c7a6b5e',
    NOW() - INTERVAL '1 day'
  ),
  (
    'c3d4e5f6-a7b8-6543-8765-3c4d5e6f7a8b',
    'Completed calibration',
    'All monitors calibrated and firmware updated to latest version',
    'd8c7d961-b7c2-4e3c-a1f0-6390cc8d9674',
    NOW() - INTERVAL '5 days'
  ),
  (
    'd4e5f6a7-b8c9-7654-8765-4d5e6f7a8b9c',
    'Diagnostic started',
    'Initial temperature readings above normal range',
    'f6a7c492-d123-4f9a-b8e1-9b9d8c7a6b5e',
    NOW() - INTERVAL '6 hours'
  ),
  (
    'e5f6a7b8-c9d0-8765-8765-5e6f7a8b9c0d',
    'Scheduled maintenance',
    'Batteries ordered, replacement scheduled for next week',
    'd8c7d961-b7c2-4e3c-a1f0-6390cc8d9674',
    NOW() - INTERVAL '12 hours'
  );