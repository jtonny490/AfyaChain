package utils

import (
	"testing"
)

func TestJWTGenerationAndValidation(t *testing.T) {
	userID := "patient1"
	role := "Patient"

	// 1. Test Generation
	token, err := GenerateToken(userID, role)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}
	if token == "" {
		t.Fatal("Expected a token, got an empty string")
	}

	// 2. Test Validation
	claims, err := ValidateToken(token)
	if err != nil {
		t.Fatalf("Failed to validate token: %v", err)
	}

	// 3. Check Claims
	if claims.UserID != userID {
		t.Errorf("Expected UserID %s, got %s", userID, claims.UserID)
	}
	if claims.Role != role {
		t.Errorf("Expected Role %s, got %s", role, claims.Role)
	}
}