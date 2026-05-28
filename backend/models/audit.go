package models

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"
)

type AuditAction string

const (
	ActionUserCreated AuditAction = "user_created"
	ActionUserLogin   AuditAction = "user_login"

	ActionRecordCreated AuditAction = "record_created"
	ActionRecordViewed  AuditAction = "record_viewed"

	ActionAccessRequested AuditAction = "access_requested"
	ActionAccessGranted   AuditAction = "access_granted"
	ActionAccessRevoked   AuditAction = "access_revoked"
)

type AuditLog struct {
	ID     int         `json:"id"`
	Action AuditAction `json:"action"`

	ActorID    int    `json:"actor_id"`
	TargetID   int    `json:"target_id,omitempty"`
	EntityType string `json:"entity_type"`

	Description string `json:"description,omitempty"`

	IPAddress string `json:"ip_address,omitempty"`

	PreviousHash string `json:"previous_hash"`
	Hash         string `json:"hash"`

	CreatedAt time.Time `json:"created_at"`
}

func (a AuditLog) GenerateHash() string {
	input := fmt.Sprintf(
		"%d%s%d%d%s%s%s%s",
		a.ID,
		a.Action,
		a.ActorID,
		a.TargetID,
		a.EntityType,
		a.Description,
		a.IPAddress,
		a.PreviousHash,
	)

	hash := sha256.Sum256([]byte(input))
	return hex.EncodeToString(hash[:])
}
