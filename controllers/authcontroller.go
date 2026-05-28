package controllers

import (
	"encoding/json"
	"net/http"

	"afyachain/db"
	"afyachain/utils"

	"github.com/gin-gonic/gin"
)

type User struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

func Register(c *gin.Context) {
	var user User
	c.ShouldBindJSON(&user)

	hash, _ := utils.HashPassword(user.Password)
	user.Password = hash

	res, err := db.Insert("users", user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", res)
}

func Login(c *gin.Context) {
	var input User
	c.ShouldBindJSON(&input)

	// query Supabase
	res, err := db.Select("users", "email=eq."+input.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var users []User
	json.Unmarshal(res, &users)

	if len(users) == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	user := users[0]

	if !utils.CheckPassword(user.Password, input.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
		return
	}

	token, _ := utils.GenerateToken(1, user.Role)

	c.JSON(http.StatusOK, gin.H{"token": token})
}
