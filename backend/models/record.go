package models

type RecordType string

const (
	RecordDiagnosis    RecordType = "diagnosis"
	RecordPrescription RecordType = "prescription"
	RecordOTC          RecordType = "otc"
	RecordLab          RecordType = "lab"
	RecordFollowUp     RecordType = "follow_up"
)

type Record struct {
	ID          int        `json:"id"`
	PatientID   int        `json:"patient_id"`
	DoctorID    *int       `json:"doctor_id,omitempty"`
	RecordType  RecordType `json:"record_type"`
	Title       string     `json:"title"`
	Description string     `json:"description"`

	DrugName string `json:"drug_name,omitempty"`
	IsOTC    bool   `json:"is_otc"`

	ChemistName     string `json:"chemist_name,omitempty"`
	ChemistLocation string `json:"chemist_location,omitempty"`

	PrescribedBy string `json:"prescribed_by,omitempty"`

	DateOfEvent string `json:"date_of_event"`
	CreatedAt   string `json:"created_at"`

	Hash string `json:"hash"`
}
