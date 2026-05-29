package routes

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestLoginRoute(t *testing.T) {
	// 1. Setup the Router
	mux := http.NewServeMux()
	AuthRoutes(mux) // Register the route

	// 2. Create a mock request payload
	payload := map[string]string{
		"id":       "patient1", // Exists in db/db.go init()
		"password": "password",
	}
	body, _ := json.Marshal(payload)

	// 3. Create the HTTP Request
	req, err := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(body))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")

	// 4. Record the Response
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	// 5. Assertions
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Check if token is in response
	var response map[string]string
	json.NewDecoder(rr.Body).Decode(&response)

	if response["token"] == "" {
		t.Errorf("Expected a JWT token in the response, got none")
	}
}