package models

type AuditAction string

const (
	ActionUserCreated     AuditAction = "user_created"
	ActionUserLogin       AuditAction = "user_login"

	ActionRecordCreated   AuditAction = "record_created"
	ActionRecordViewed    AuditAction = "record_viewed"

	ActionAccessRequested AuditAction = "access_requested"
	ActionAccessGranted   AuditAction = "access_granted"
	ActionAccessRevoked   AuditAction = "access_revoked"
)