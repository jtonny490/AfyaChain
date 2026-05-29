package controllers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"time"

	"afyachain/contracts"
	"afyachain/db"

	"github.com/gin-gonic/gin"
)

// RecordRequest represents incoming data
type RecordRequest struct {
	PatientID   int     `json:"patient_id"`
	DoctorID    *int    `json:"doctor_id"` // nullable
	Title       string  `json:"title"`
	Description string  `json:"description"`
	RecordType  string  `json:"record_type"`
	DateOfEvent string  `json:"date_of_event"`
}

// RecordResponse represents response data
type RecordResponse struct {
	ID          int     `json:"id"`
	PatientID   int     `json:"patient_id"`
	DoctorID    *int    `json:"doctor_id"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	RecordType  string  `json:"record_type"`
	DateOfEvent string  `json:"date_of_event"`
	Hash        string  `json:"hash"`
	TokenID     string  `json:"token_id"`
	TxHash      string  `json:"tx_hash"`
	CreatedAt   string  `json:"created_at"`
}

var afyaChain *contracts.AfyaChain

func InitContracts() {
	var err error

	afyaChain, err = contracts.NewContracts()

	if err != nil {
		println("Warning: Ethereum contract init failed:", err.Error())
	}
}

func UploadRecord(c *gin.Context) {
	var req RecordRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request data",
		})
		return
	}

	// Generate hash
	hash := generateRecordHash(req)

	// Build DB object
	recordData := map[string]interface{}{
		"patient_id":    req.PatientID,
		"doctor_id":     req.DoctorID,
		"title":         req.Title,
		"description":   req.Description,
		"record_type":   req.RecordType,
		"date_of_event": req.DateOfEvent,
		"hash":          hash,
		"created_at":    time.Now().Format(time.RFC3339),
	}

	// Insert into database
	insertRes, err := db.Insert("records", recordData)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	println("Insert success:", string(insertRes))

	// Mint NFT
	var tokenID string
	var txHash string

	if afyaChain != nil {
		tokenID, txHash, err = afyaChain.MintNFT(
			req.PatientID,
			req.Title,
			req.Description,
			req.RecordType,
			req.DateOfEvent,
		)

		if err != nil {
			println("NFT mint warning:", err.Error())
		}
	}

	// Save NFT data if minted
	if tokenID != "" {
		recordData["token_id"] = tokenID
		recordData["tx_hash"] = txHash
	}

	c.JSON(http.StatusOK, RecordResponse{
		PatientID:   req.PatientID,
		DoctorID:    req.DoctorID,
		Title:       req.Title,
		Description: req.Description,
		RecordType:  req.RecordType,
		DateOfEvent: req.DateOfEvent,
		Hash:        hash,
		TokenID:     tokenID,
		TxHash:      txHash,
		CreatedAt:   recordData["created_at"].(string),
	})
}

func GetRecords(c *gin.Context) {
	res, err := db.Select("records", "")

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	var data []map[string]interface{}

	json.Unmarshal(res, &data)

	c.JSON(http.StatusOK, data)
}

func generateRecordHash(req RecordRequest) string {
	data := req.Title +
		req.Description +
		req.RecordType +
		req.DateOfEvent

	hash := sha256.Sum256([]byte(data))

	return hex.EncodeToString(hash[:])
}
