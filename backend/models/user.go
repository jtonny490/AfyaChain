package models

const (
	RolePatient = "patient"
	RoleDoctor  = "doctor"
)

const (
	GenderMale   = "male"
	GenderFemale = "female"
	GenderOther  = "other"
)

type User struct {
	ID          int    `json:"id"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	Role        string `json:"role"`
	ProfilePic  string `json:"profile_pic"`
	Gender      string `json:"gender"`
	YearOfBirth int    `json:"year_of_birth"`
}

func (u User) IsValidRole() bool {
	return u.Role == RolePatient || u.Role == RoleDoctor
}

func (u User) IsValidGender() bool {
	return u.Gender == GenderMale || u.Gender == GenderFemale || u.Gender == GenderOther
}

func (u User) IsValidYearOfBirth() bool {
	if u.YearOfBirth < 1900 || u.YearOfBirth > 2026 {
		return false
	}
	return true
}
