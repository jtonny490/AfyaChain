package main

import (
	"afyachain/controllers"
	"afyachain/routes"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	} else {
		log.Println(".env file loaded successfully")
	}

	// Debug: Check if environment variables are loaded
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	log.Printf("SUPABASE_URL: %v", supabaseURL)
	log.Printf("SUPABASE_KEY length: %d", len(supabaseKey))

	// Initialize blockchain contracts
	controllers.InitContracts()

	r := gin.Default()

	// =========================
	// 🔹 SERVE FRONTEND FILES
	// =========================
	r.Static("/frontend", "./frontend")
	r.StaticFile("/", "./frontend/index.html")

	// =========================
	// 🔹 API ROUTES
	// =========================
	api := r.Group("/api")
	{
		routes.AuthRoutes(api)
		routes.RecordRoutes(api)
		routes.AccessRoutes(api)
		routes.AuditRoutes(api)
	}

	r.Run(":8080")
}
