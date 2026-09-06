package auth

import (
	"steam-backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	authGroup := rg.Group("/auth")
	{
		authGroup.POST("/register", handler.Register)
		authGroup.POST("/login", handler.Login)

		protected := authGroup.Group("")
		protected.Use(middleware.AuthRequired())
		{
			protected.GET("/me", handler.Me)
		}
	}
	adminGroup := rg.Group("/admin")
	adminGroup.Use(middleware.AuthRequired(), middleware.RoleRequired("admin"))
	{
		adminGroup.GET("/developers/pending", handler.GetPendingDevelopers)
		adminGroup.PATCH("/developers/:id/verify", handler.VerifyDeveloper)
	}

}
