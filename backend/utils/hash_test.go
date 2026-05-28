package utils

import (
	"testing"
)

func TestGenerateHash(t *testing.T) {
	data := "patient_medical_record_data"
	
	hash1 := GenerateHash(data)
	hash2 := GenerateHash(data)

	// 1. Hashes of the same data should be identical (Deterministic)
	if hash1 != hash2 {
		t.Errorf("Expected hashes to be identical, got %s and %s", hash1, hash2)
	}

	// 2. SHA-256 hex string should always be 64 characters long
	if len(hash1) != 64 {
		t.Errorf("Expected hash length 64, got %d", len(hash1))
	}
}