package controllers

import (
	"net/http"

	"afyachain/db"

	"github.com/gin-gonic/gin"
)

type Access struct {
	RecordID int  `json:"record_id"`
	UserID   int  `json:"user_id"`
	Granted  bool `json:"granted"`
}

func GrantAccess(c *gin.Context) {
	var access Access

	if err := c.ShouldBindJSON(&access); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := db.Insert("access", access)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", res)
}
