-- Migration: Add registration_number and phone_number to users table
-- Run this if you already have an existing database

-- Add registration_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'registration_number'
  ) THEN
    ALTER TABLE users ADD COLUMN registration_number VARCHAR(50);
  END IF;
END $$;

-- Add phone_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
  END IF;
END $$;

-- Create index for registration_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_registration_number ON users(registration_number);

COMMENT ON COLUMN users.registration_number IS 'Student registration/ID number';
COMMENT ON COLUMN users.phone_number IS 'Student contact phone number';
