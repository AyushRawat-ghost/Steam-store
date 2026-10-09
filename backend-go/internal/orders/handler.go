package orders

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func getUserID(c *gin.Context) uint {
	if val, exists := c.Get("userID"); exists {
		if id, ok := val.(uint); ok {
			return id
		}
	}
	return 0
}

func (h *Handler) GetCart(c *gin.Context) {
	userID := getUserID(c)
	cart, err := h.service.GetCart(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": cart})
}

func (h *Handler) AddToCart(c *gin.Context) {
	userID := getUserID(c)
	var req AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.AddToCart(userID, req.GameID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return fresh cart summary
	cart, err := h.service.GetCart(userID)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "Item added to cart"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Item added to cart successfully",
		"data":    cart,
	})
}

func (h *Handler) RemoveFromCart(c *gin.Context) {
	userID := getUserID(c)
	gameIDStr := c.Param("gameId")
	gameID, err := strconv.ParseUint(gameIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid game ID"})
		return
	}

	if err := h.service.RemoveFromCart(userID, uint(gameID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	cart, _ := h.service.GetCart(userID)
	c.JSON(http.StatusOK, gin.H{
		"message": "Item removed from cart",
		"data":    cart,
	})
}

func (h *Handler) ClearCart(c *gin.Context) {
	userID := getUserID(c)
	if err := h.service.ClearCart(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared successfully"})
}

func (h *Handler) GetLibrary(c *gin.Context) {
	userID := getUserID(c)
	library, err := h.service.GetUserLibrary(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": library})
}

func (h *Handler) GetWallet(c *gin.Context) {
	userID := getUserID(c)
	user, txs, err := h.service.GetWallet(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"balance":      user.WalletBalance,
			"transactions": txs,
		},
	})
}

func (h *Handler) DepositFunds(c *gin.Context) {
	userID := getUserID(c)
	var req DepositRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.service.DepositFunds(userID, req.Amount)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Funds successfully deposited into your Steam Wallet",
		"data": gin.H{
			"balance": user.WalletBalance,
		},
	})
}

func (h *Handler) Checkout(c *gin.Context) {
	userID := getUserID(c)
	checkoutRes, err := h.service.Checkout(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": checkoutRes.Message,
		"data":    checkoutRes,
	})
}
