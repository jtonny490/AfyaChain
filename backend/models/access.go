package models

type AccessStatus string

const (
	AccessPending  AccessStatus = "pending"
	AccessApproved AccessStatus = "approved"
	AccessRejected AccessStatus = "rejected"
	AccessExpired  AccessStatus = "expired"
)

type AccessScope string

const (
	ScopeReadOnly AccessScope = "read_only"
	ScopeFull     AccessScope = "full"
)

type Access struct {
	ID        int `json:"id"`
	PatientID int `json:"patient_id"`
	DoctorID  int `json:"doctor_id"`

	Status AccessStatus `json:"status"`
	Scope  AccessScope  `json:"scope"`

	RequestReason string `json:"request_reason"`

	CreatedAt string `json:"created_at"`
	ExpiresAt string `json:"expires_at"`
}
