package routes

import (
	"afyachain/controllers"
	"afyachain/utils"

	"github.com/gin-gonic/gin"
)

func AuditRoutes(r *gin.RouterGroup) {

	r.GET("/audit", utils.AuthMiddleware(), controllers.GetAuditLogs)
}