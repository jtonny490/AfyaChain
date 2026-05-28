package routes

import (
	"net/http"
	"afyachain/backend/controllers"
	"afyachain/backend/utils"
)

// AuditRoutes handles querying the immutable blockchain logs
func AuditRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/audit", utils.AuthMiddleware(controllers.GetAudits))
}