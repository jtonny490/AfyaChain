package models

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