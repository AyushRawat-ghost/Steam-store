package orders

import (
	"steam-backend/internal/games"
	"steam-backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	ordersRepo := NewRepository(db)
	gamesRepo := games.NewRepository(db)
	service := NewService(ordersRepo, gamesRepo)
	handler := NewHandler(service)

	// Cart routes (requires authentication)
	cartGroup := rg.Group("/cart")
	cartGroup.Use(middleware.AuthRequired())
	{
		cartGroup.GET("", handler.GetCart)
		cartGroup.POST("/items", handler.AddToCart)
		cartGroup.DELETE("/items/:gameId", handler.RemoveFromCart)
		cartGroup.DELETE("", handler.ClearCart)
		cartGroup.POST("/checkout", handler.Checkout)
	}

	// User Library routes
	libraryGroup := rg.Group("/library")
	libraryGroup.Use(middleware.AuthRequired())
	{
		libraryGroup.GET("", handler.GetLibrary)
	}

	// Wallet routes
	walletGroup := rg.Group("/wallet")
	walletGroup.Use(middleware.AuthRequired())
	{
		walletGroup.GET("", handler.GetWallet)
		walletGroup.POST("/deposit", handler.DepositFunds)
	}
}
