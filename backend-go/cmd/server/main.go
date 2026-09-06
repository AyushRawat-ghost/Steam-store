package main

import (
	"log"
	"os"
	"steam-backend/internal/auth"
	"steam-backend/pkg/database"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(".env"); err != nil {
		if err := godotenv.Load("../.env"); err != nil {
			if err := godotenv.Load("../../.env"); err != nil {
				log.Println("Note: No .env file found, relying on system environment variables")
			}
		}
	}

	db := database.Connect()
	err := db.AutoMigrate(&auth.User{})
	if err != nil {
		log.Fatal("Database Auto migration failed")
	}
	log.Println("Database schema migrated...")
	r := gin.Default()
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "Healthy",
			"message": "Steam backend is running",
		})
	})
	v1 := r.Group("/api/v1")
	auth.RegisterRoutes(v1, db)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}
	log.Printf("Server starting on port %s ", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to run ")
	}
}
