package models

type AccessStatus string

const (
	AccessPending  AccessStatus = "pending"
	AccessApproved AccessStatus = "approved"
	AccessRejected AccessStatus = "rejected"
	AccessRevoked  AccessStatus = "revoked"
	AccessExpired  AccessStatus = "expired"
)

type AccessScope string

const (
	ScopeSummary     AccessScope = "summary"
	ScopeFullHistory AccessScope = "full_history"
	ScopePrescription AccessScope = "prescription_only"
	ScopeLab         AccessScope = "lab_results_only"
)

type PrivacyLevel string

const (
	PrivacyPrivate   PrivacyLevel = "private"
	PrivacyRestricted PrivacyLevel = "restricted"
	PrivacyOpen      PrivacyLevel = "open_emergency"
)

type Access struct {
	ID         int          `json:"id"`
	PatientID  int          `json:"patient_id"`
	DoctorID   int          `json:"doctor_id"`

	Status     AccessStatus `json:"status"`
	Scope      AccessScope  `json:"scope"`

	RequestReason string    `json:"request_reason"`
	RevokeReason  string    `json:"revoke_reason,omitempty"`

	CreatedAt  string       `json:"created_at"`
	UpdatedAt  string       `json:"updated_at"`
	ExpiresAt  string       `json:"expires_at"`
}

type PatientAccessPolicy struct {
	PatientID       int         `json:"patient_id"`
	DefaultPrivacy  PrivacyLevel `json:"default_privacy"`
	TrustedDoctors  []int      `json:"trusted_doctors"`
	AllowEmergency  bool       `json:"allow_emergency"`
}