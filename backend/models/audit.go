package models

import "time"

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
	ID int `json:"id"`

	Action AuditAction `json:"action"`

	ActorID  int `json:"actor_id"`
	TargetID int `json:"target_id,omitempty"`

	EntityType string `json:"entity_type"`

	Description string `json:"description"`

	IPAddress string `json:"ip_address,omitempty"`

	CreatedAt time.Time `json:"created_at"`

	Hash string `json:"hash"`
}
