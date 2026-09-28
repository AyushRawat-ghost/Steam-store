package games

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type GameStatus string

const (
	StatusPending  GameStatus = "pending"
	StatusApproved GameStatus = "approved"
	StatusRejected GameStatus = "rejected"
)

type Game struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	Title            string         `gorm:"index;not null" json:"title"`
	Slug             string         `gorm:"uniqueIndex;not null" json:"slug"`
	ShortDescription string         `gorm:"type:varchar(255);not null" json:"short_description"`
	Description      string         `gorm:"type:text;not null" json:"description"`
	Price            float64        `gorm:"not null;default:0.0" json:"price"`
	DiscountPercent  int            `gorm:"default:0" json:"discount_percent"`
	BannerURL        string         `gorm:"not null" json:"banner_url"`
	ThumbnailURL     string         `gorm:"not null" json:"thumbnail_url"`
	Screenshots      pq.StringArray `gorm:"type:text[]" json:"screenshots"`
	Genres           pq.StringArray `gorm:"type:text[]" json:"genres"`
	DeveloperID      uint           `gorm:"index;not null" json:"developer_id"`
	Status           GameStatus     `gorm:"type:varchar(20);default:'pending';not null" json:"status"`
	IsFeatured       bool           `gorm:"default:false" json:"is_featured"`
	IsPublished      bool           `gorm:"default:true" json:"is_published"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

type CreateGameRequest struct {
	Title            string   `json:"title" binding:"required"`
	ShortDescription string   `json:"short_description" binding:"required,max=255"`
	Description      string   `json:"description" binding:"required"`
	Price            float64  `json:"price" binding:"min=0"`
	DiscountPercent  int      `json:"discount_percent" binding:"min=0,max=90"`
	BannerURL        string   `json:"banner_url" binding:"required"`
	ThumbnailURL     string   `json:"thumbnail_url" binding:"required"`
	Screenshots      []string `json:"screenshots"`
	Genres           []string `json:"genres" binding:"required"`
	IsPublished      bool     `json:"is_published"`
}

type UpdateGameRequest struct {
	Title            string   `json:"title"`
	ShortDescription string   `json:"short_description"`
	Description      string   `json:"description"`
	Price            *float64 `json:"price"`
	DiscountPercent  *int     `json:"discount_percent"`
	BannerURL        string   `json:"banner_url"`
	ThumbnailURL     string   `json:"thumbnail_url"`
	Screenshots      []string `json:"screenshots"`
	Genres           []string `json:"genres"`
	IsPublished      *bool    `json:"is_published"`
}

type AdminUpdateStatusRequest struct {
	Status     string `json:"status" binding:"required"`
	IsFeatured *bool  `json:"is_featured"`
}
