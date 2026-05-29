package db

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func setupMockServer() *httptest.Server {

	handler := http.NewServeMux()

	// Mock INSERT endpoint
	handler.HandleFunc("/rest/v1/users", func(w http.ResponseWriter, r *http.Request) {

		if r.Method == "POST" {

			response := []map[string]interface{}{
				{
					"id":    1,
					"name":  "Test User",
					"email": "test@example.com",
				},
			}

			json.NewEncoder(w).Encode(response)
			return
		}

		if r.Method == "GET" {

			response := []map[string]interface{}{
				{
					"id":    1,
					"name":  "Test User",
					"email": "test@example.com",
				},
			}

			json.NewEncoder(w).Encode(response)
			return
		}
	})

	return httptest.NewServer(handler)
}
