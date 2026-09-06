package middleware

import (
	"net/http"
	"strings"

	"steam-backend/pkg/jwt"

	"github.com/gin-gonic/gin"
)

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer <token>"})
			c.Abort()
			return
		}
		claims, err := jwt.ValidateToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: " + err.Error()})
			c.Abort()
			return
		}
		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Next()
	}
}

func RoleRequired(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRoleVal, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: role not found in context"})
			c.Abort()
			return
		}
		userRole, ok := userRoleVal.(string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid role format in context"})
			c.Abort()
			return
		}
		for _, role := range allowedRoles {
			if userRole == role {
				c.Next()
				return
			}
		}
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: insufficient permissions"})
		c.Abort()
	}
}
