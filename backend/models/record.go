package models

type RecordType string

const (
	RecordDiagnosis   RecordType = "diagnosis"
	RecordPrescription RecordType = "prescription"
	RecordOTC         RecordType = "otc"
	RecordLab         RecordType = "lab"
	RecordFollowUp    RecordType = "follow_up"
)

type RecordSource string

const (
	SourceDoctor   RecordSource = "doctor"
	SourcePatient  RecordSource = "patient"
	SourcePharmacy RecordSource = "pharmacy"
)

type RecordSensitivity string

const (
	SensitivityLow       RecordSensitivity = "low"
	SensitivityMedium    RecordSensitivity = "medium"
	SensitivityHigh      RecordSensitivity = "high"
	SensitivityCritical  RecordSensitivity = "critical"
)

type Record struct {
	ID          int              `json:"id"`
	PatientID   int              `json:"patient_id"`
	DoctorID    *int             `json:"doctor_id,omitempty"`

	RecordType  RecordType       `json:"record_type"`
	Source      RecordSource     `json:"source"`

	Title       string           `json:"title"`
	Description string           `json:"description"`

	DrugName    string           `json:"drug_name,omitempty"`
	IsOTC       bool             `json:"is_otc"`

	ChemistName string           `json:"chemist_name,omitempty"`
	ChemistLocation string       `json:"chemist_location,omitempty"`

	PrescribedBy string          `json:"prescribed_by,omitempty"`

	Sensitivity  RecordSensitivity `json:"sensitivity"`

	DateOfEvent  string          `json:"date_of_event"`
	CreatedAt    string          `json:"created_at"`

	Hash         string          `json:"hash"`
}
