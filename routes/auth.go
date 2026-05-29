package routes

import (
	"afyachain/controllers"
	

	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.RouterGroup) {

	r.POST("/register", controllers.Register)
	r.POST("/login", controllers.Login)
}
