package games

import (
	"steam-backend/internal/middleware"
	"steam-backend/pkg/s3"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(rg *gin.RouterGroup, db *gorm.DB, s3Client *s3.S3Client) {
	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service, s3Client)

	// Public Storefront routes
	gamesGroup := rg.Group("/games")
	{
		gamesGroup.GET("", handler.GetGames)
		gamesGroup.GET("/featured", handler.GetFeaturedGames)
		gamesGroup.GET("/:idOrSlug", handler.GetGame)
	}

	// S3 Asset Upload
	uploadGroup := rg.Group("/upload")
	uploadGroup.Use(middleware.AuthRequired())
	{
		uploadGroup.POST("/s3", handler.UploadS3Asset)
	}

	// Developer routes (Authenticated as developer or admin)
	developerGroup := rg.Group("/developer")
	developerGroup.Use(middleware.AuthRequired(), middleware.RoleRequired("developer", "admin"))
	{
		developerGroup.GET("/games", handler.GetDeveloperGames)
		developerGroup.POST("/games", handler.PublishGame)
		developerGroup.PUT("/games/:id", handler.UpdateDeveloperGame)
		developerGroup.DELETE("/games/:id", handler.DeleteDeveloperGame)
	}

	// Admin routes
	adminGroup := rg.Group("/admin")
	adminGroup.Use(middleware.AuthRequired(), middleware.RoleRequired("admin"))
	{
		adminGroup.GET("/games", handler.AdminGetAllGames)
		adminGroup.PATCH("/games/:id/status", handler.AdminUpdateStatus)
		adminGroup.PUT("/games/:id/status", handler.AdminUpdateStatus)
	}
}
