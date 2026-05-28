package utils

import (
	"crypto/sha256"
	"encoding/hex"
)

// GenerateHash simulates creating an immutable on-chain hash for medical records
func HashPassword(data string) string {
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}