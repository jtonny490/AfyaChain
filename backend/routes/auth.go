package routes

import (
	"net/http"
	"afyachain/backend/controllers"
)

// AuthRoutes handles all authentication and identity verification endpoints
func AuthRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/auth/login", controllers.Login)
}