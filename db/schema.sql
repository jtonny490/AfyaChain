-- Complete schema for records table with NFT support
-- Run this SQL in your Supabase SQL editor

-- Create records table if it doesn't exist
CREATE TABLE IF NOT EXISTS records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER,
    record_type VARCHAR(50),
    source VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    drug_name VARCHAR(255),
    is_otc BOOLEAN DEFAULT FALSE,
    chemist_name VARCHAR(255),
    chemist_location VARCHAR(255),
    prescribed_by VARCHAR(255),
    sensitivity VARCHAR(50),
    date_of_event DATE,
    created_at TIMESTAMP DEFAULT NOW(),
     hash VARCHAR(64) NOT NULL UNIQUE,
    token_id VARCHAR(64),
    tx_hash VARCHAR(66)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_records_patient_id ON records(patient_id);
CREATE INDEX IF NOT EXISTS idx_records_doctor_id ON records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_records_token_id ON records(token_id);
CREATE INDEX IF NOT EXISTS idx_records_date_of_event ON records(date_of_event);

-- Add foreign key constraints (optional, if you have users table)
-- ALTER TABLE records 
--     ADD CONSTRAINT fk_patient 
--     FOREIGN KEY (patient_id) 
--     REFERENCES users(id);
-- 
-- ALTER TABLE records 
--     ADD CONSTRAINT fk_doctor 
--     FOREIGN KEY (doctor_id) 
--     REFERENCES users(id);