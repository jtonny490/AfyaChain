package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"afyachain/routes"
	"github.com/gin-gonic/gin"

)

var router *gin.Engine
var authToken string

// setup testing the server
func(){
	gin.SetMode(gin.TestMode)
	router = gin.Default()
	routes.SetupRouters(router)
}

//Helper: make request
func performRequest(method, path string, body []byte, token string) *httptest.ResponseRecorder {
	req, _ := http.NewRequest(method, path, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	if token != ""{
		req.Header.Set("Authorization", token)
	}

	w:= httptest.NewRecorder()
	router.ServerHTTP(w, req)
	return w
}

//auth test (auth.go + authcontroller.go)
func TestAuthRegister(t *testing.T){
	body := []byte(`{
	"name":"Tester",
	"email":"tester@afyachain.com",
	"password":"123456",
	"role":"patient"
	}`)

	res := request("POST", "/api/register", body, false)

	if res.Code != 200{
		t.Fatalf("register failed %d", res.Code)
	}
}

func TestAuthRegister(t *testing.T) {
	body := []byte(`{
		"name":"Tester",
		"email":"tester@afyachain.com",
		"password":"123456",
		"role":"patient"
	}`)

	res := request("POST", "/api/register", body, false)

	if res.Code != 200 {
		t.Fatalf("register failed: %d", res.Code)
	}
}


func TestAuthLogin(t *testing.T){
	body := []byte(`{
		"email":"tester@afyachain.com"
		'password":"123456"
	}`)

	res := request("POST", "/api/login", body, false)
	if res.Code != 200 {
		t.Fatalf("login failed: %d", res.Code)
	}

	var resp map[string]string
	json.Unmarshal(res.Body.Bytes(), &resp)

	token = resp["token"]

	if token == "" {
		t.Fatal("no token returned")
	}
}

func TestUploadRecord(t *testing.T) {
	body := []byte(`{
		"patient_id":1,
		"doctor_id":2,
		"data_hash":"hash123",
		"file_url":"https://supabase.co/file.pdf"
	}`)func TestUploadRecord(t *testing.T) {
	body := []byte(`{
		"patient_id":1,
		"doctor_id":2,
		"data_hash":"hash123",
		"file_url":"https://supabase.co/file.pdf"
	}`)

	res := request("POST", "/api/records", body, true)

	if res.Code != 200 {
		t.Fatalf("upload record failed: %d", res.Code)
	}
}

func TestGetRecords(t *testing.T) {
	res := request("GET", "/api/records", nil, true)

	if res.Code != 200 {
		t.Fatalf("get records failed: %d", res.Code)
	}
}

	res := request("POST", "/api/records", body, true)

	if res.Code != 200 {
		t.Fatalf("upload record failed: %d", res.Code)
	}
}

func TestGetRecords(t *testing.T) {
	res := request("GET", "/api/records", nil, true)

	if res.Code != 200 {
		t.Fatalf("get records failed: %d", res.Code)
	}
}

func TestGrantAccess(t *testing.T) {
	body := []byte(`{
		"record_id":1,
		"user_id":2,
		"granted":true
	}`)

	res := request("POST", "/api/access", body, true)

	if res.Code != 200 {
		t.Fatalf("grant access failed: %d", res.Code)
	}
}