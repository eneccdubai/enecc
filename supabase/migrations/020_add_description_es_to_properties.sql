-- Add Spanish description field to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS description_es TEXT;
