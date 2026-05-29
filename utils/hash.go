package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"
)

// HashPassword is used for user passwords (simple SHA-256 version)
func HashPassword(password string) string {
	hash := sha256.Sum256([]byte(password))
	return hex.EncodeToString(hash[:])
}

// CheckPassword compares raw password with hashed password
func CheckPassword(hashed, password string) bool {
	return HashPassword(password) == hashed
}

// GenerateRecordHash creates a secure hash for medical records
func GenerateRecordHash(patientID int, doctorID int, data string, previousHash string) string {
	input := fmt.Sprintf(
		"%d:%d:%s:%s:%d",
		patientID,
		doctorID,
		data,
		previousHash,
		time.Now().UnixNano(),
	)

	hash := sha256.Sum256([]byte(input))
	return hex.EncodeToString(hash[:])
}
