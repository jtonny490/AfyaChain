package controllers

import (
	"encoding/json"
	"net/http"

	"afyachain/db"

	"github.com/gin-gonic/gin"
)

type Record struct {
	PatientID int    `json:"patient_id"`
	DoctorID  int    `json:"doctor_id"`
	Title     string `json:"title"`
	Description string `json:"description"`
	FileURL   string `json:"file_url"`
	Hash      string `json:"hash"`
}

func UploadRecord(c *gin.Context) {
	var record Record
	c.ShouldBindJSON(&record)

	res, err := db.Insert("records", record)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Data(http.StatusOK, "application/json", res)
}

func GetRecords(c *gin.Context) {
	res, err := db.Select("records", "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var data []map[string]interface{}
	json.Unmarshal(res, &data)

	c.JSON(http.StatusOK, data)
}
