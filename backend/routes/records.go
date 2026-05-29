package routes

import (
	"afyachain/controllers"
	"afyachain/utils"

	"github.com/gin-gonic/gin"
)

func RecordRoutes(r *gin.RouterGroup) {
	r.POST("/records", utils.AuthMiddleware(), controllers.UploadRecord)
	r.GET("/records", utils.AuthMiddleware(), controllers.GetRecords)
}
