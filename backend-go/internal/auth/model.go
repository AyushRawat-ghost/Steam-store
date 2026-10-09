package auth

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleGamer     UserRole = "gamer"
	RoleAdmin     UserRole = "admin"
	RoleDeveloper UserRole = "developer"
)

// User model stored in PostgreSQL
type User struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	Email        string `gorm:"uniqueIndex;not null" json:"email"`
	Username     string `gorm:"uniqueIndex;not null" json:"username"`
	PasswordHash string `gorm:"not null" json:"-"` // "-" hides password from JSON output

	Role          UserRole       `gorm:"type:varchar(20);default:'gamer';not null" json:"role"`
	IsVerified    bool           `gorm:"default:false;not null" json:"is_verified"`
	Status        string         `gorm:"type:varchar(20);default:'active'" json:"status"`
	AvatarURL     string         `json:"avatar_url"`
	WalletBalance float64        `gorm:"type:decimal(10,2);default:100.00;not null" json:"wallet_balance"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`	
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// RegisterRequest payload sent by client
type RegisterRequest struct {
	Email    string   `json:"email" binding:"required,email"`
	Username string   `json:"username" binding:"required,min=3,max=30"`
	Password string   `json:"password" binding:"required,min=6"`
	Role     UserRole `json:"role"` // Defaults to "gamer" if empty
}

// LoginRequest payload sent by client
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse returned after successful login/register
type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
