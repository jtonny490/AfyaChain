package routes

import (
	"net/http"
	"afyachain/backend/controllers"
	"afyachain/backend/utils"
)

// RecordRoutes handles fetching and creating medical records (Requires Authentication)
func RecordRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/records", utils.AuthMiddleware(controllers.GetRecords))
	mux.HandleFunc("/api/records/create", utils.AuthMiddleware(controllers.CreateRecord))
}