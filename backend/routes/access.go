package routes

import (
	"net/http"
	"afyachain/backend/controllers"
	"afyachain/backend/utils"
)

// AccessRoutes handles granting/revoking permission to doctors/hospitals
func AccessRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/access/grant", utils.AuthMiddleware(controllers.GrantAccess))
	// Future: mux.HandleFunc("/api/access/revoke", utils.AuthMiddleware(controllers.RevokeAccess))
}