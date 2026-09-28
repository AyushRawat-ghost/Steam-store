package games

import (
	"net/http"
	"steam-backend/pkg/s3"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service  Service
	s3Client *s3.S3Client
}

func NewHandler(service Service, s3Client *s3.S3Client) *Handler {
	return &Handler{service: service, s3Client: s3Client}
}

func getUserID(c *gin.Context) uint {
	if val, exists := c.Get("userID"); exists {
		if id, ok := val.(uint); ok {
			return id
		}
	}
	if val, exists := c.Get("user_id"); exists {
		if id, ok := val.(uint); ok {
			return id
		}
	}
	return 0
}

func (h *Handler) PublishGame(c *gin.Context) {
	var req CreateGameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	devID := getUserID(c)
	game, err := h.service.CreateGame(req, devID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Game published successfully", "data": game})
}

func (h *Handler) GetGames(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	genre := c.Query("genre")
	search := c.Query("search")
	games, err := h.service.GetGames(genre, search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": games})
}

func (h *Handler) GetFeaturedGames(c *gin.Context) {
	games, err := h.service.GetFeaturedGames()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": games})
}

func (h *Handler) GetGame(c *gin.Context) {
	idOrSlug := c.Param("idOrSlug")
	game, err := h.service.GetGame(idOrSlug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Game not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": game})
}

func (h *Handler) GetGameByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid game ID"})
		return
	}
	game, err := h.service.GetGameByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Game not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": game})
}

func (h *Handler) GetDeveloperGames(c *gin.Context) {
	devID := getUserID(c)
	games, err := h.service.GetDeveloperGames(devID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": games})
}

func (h *Handler) UpdateDeveloperGame(c *gin.Context) {
	gameID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid game ID"})
		return
	}
	var req UpdateGameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	devID := getUserID(c)
	game, err := h.service.UpdateDeveloperGame(uint(gameID), devID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Game updated successfully", "data": game})
}

func (h *Handler) DeleteDeveloperGame(c *gin.Context) {
	gameID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid game ID"})
		return
	}
	devID := getUserID(c)
	if err := h.service.DeleteDeveloperGame(uint(gameID), devID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) UploadS3Asset(c *gin.Context) {
	if h.s3Client == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "S3 Client not configured"})
		return
	}
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File form field is required"})
		return
	}
	folder := c.DefaultPostForm("folder", "steam/games")
	s3Url, err := h.s3Client.UploadFile(file, folder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload to S3: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Uploaded to S3 successfully", "url": s3Url})
}

func (h *Handler) AdminGetAllGames(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	games, err := h.service.AdminGetAllGames(page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": games})
}

func (h *Handler) AdminUpdateStatus(c *gin.Context) {
	gameID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid game ID"})
		return
	}
	var req AdminUpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.service.AdminUpdateStatus(uint(gameID), GameStatus(req.Status), req.IsFeatured); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Game status updated successfully"})
}
