package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"afyachain/db"
	"afyachain/models"
	"afyachain/utils"

	"github.com/gin-gonic/gin"
)

type RegisterInput struct {
	FirstName   string `json:"first_name" binding:"required"`
	LastName    string `json:"last_name" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6"`
	Role        string `json:"role" binding:"required,oneof=patient doctor"`
	Gender      string `json:"gender,omitempty"`
	YearOfBirth int    `json:"year_of_birth,omitempty"`
}

type UserResponse struct {
	ID          int       `json:"id"`
	FirstName   string    `json:"first_name"`
	LastName    string    `json:"last_name"`
	Email       string    `json:"email"`
	Password    string    `json:"password"`
	Role        string    `json:"role"`
	ProfilePic  string    `json:"profile_pic,omitempty"`
	Gender      string    `json:"gender,omitempty"`
	YearOfBirth int       `json:"year_of_birth,omitempty"`
	CreatedAt   string    `json:"created_at"`
}

func Register(c *gin.Context) {
	var input RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// hash password
	input.Password = utils.HashPassword(input.Password)

	res, err := db.Insert("users", input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Debug: Print the raw response
	fmt.Printf("Supabase response: %s\n", string(res))

	// Supabase returns an array of inserted records
	var users []UserResponse
	if err := json.Unmarshal(res, &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse response: " + err.Error()})
		return
	}

	if len(users) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No user returned from Supabase"})
		return
	}

	user := users[0]

	c.JSON(http.StatusOK, gin.H{
		"message": "User registered successfully",
		"user":    user,
	})
}

func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := db.Select("users", "email=eq."+input.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Supabase returns an array of matching records
	var dbUsers []models.User
	if err := json.Unmarshal(res, &dbUsers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(dbUsers) == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	dbUser := dbUsers[0]

	if !utils.CheckPassword(dbUser.Password, input.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid password"})
		return
	}

	token, err := utils.GenerateToken(fmt.Sprintf("%d", dbUser.ID), dbUser.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token error"})
		return
	}

	userResponse := UserResponse{
		ID:        dbUser.ID,
		FirstName: dbUser.FirstName,
		LastName:  dbUser.LastName,
		Email:     dbUser.Email,
		Role:      dbUser.Role,
		ProfilePic: dbUser.ProfilePic,
		Gender:    dbUser.Gender,
		YearOfBirth: dbUser.YearOfBirth,
		CreatedAt: dbUser.CreatedAt,
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  userResponse,
	})
}