-- Migration: Add NFT columns to records table
-- Run this SQL in your Supabase SQL editor

-- Add token_id column to store the NFT token ID
ALTER TABLE records 
ADD COLUMN IF NOT EXISTS token_id VARCHAR(64);

-- Add tx_hash column to store the Ethereum transaction hash
ALTER TABLE records 
ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(66);

-- Add index for faster queries by token_id
CREATE INDEX IF NOT EXISTS idx_records_token_id ON records(token_id);

-- Add index for faster queries by patient_id
CREATE INDEX IF NOT EXISTS idx_records_patient_id ON records(patient_id);

-- Add unique constraint on hash to prevent duplicate records
ALTER TABLE records 
ADD CONSTRAINT uq_records_hash UNIQUE (hash);

-- Optional: Add a comment to document the columns
COMMENT ON COLUMN records.token_id IS 'Ethereum NFT token ID for the patient record';
COMMENT ON COLUMN records.tx_hash IS 'Ethereum transaction hash for the NFT minting transaction';