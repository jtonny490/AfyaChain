package controllers

import (
	"net/http"

	"afyachain/db"

	"github.com/gin-gonic/gin"
)

func GetAuditLogs(c *gin.Context) {

	res, err := db.Select("audit", "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", res)
}
