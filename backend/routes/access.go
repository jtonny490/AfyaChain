package routes

import (
	"afyachain/controllers"
	"afyachain/utils"

	"github.com/gin-gonic/gin"
)

func AccessRoutes(r *gin.RouterGroup) {
	r.POST("/access", utils.AuthMiddleware(), controllers.GrantAccess)
}
