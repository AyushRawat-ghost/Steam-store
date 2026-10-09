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
	Edition          string         `json:"edition"`
	ShortDescription string         `gorm:"type:varchar(500);not null" json:"short_description"`
	Description      string         `gorm:"type:text;not null" json:"description"`
	Price            float64        `gorm:"not null;default:0.0" json:"price"`
	DiscountPercent  int            `gorm:"default:0" json:"discount_percent"`
	BannerURL        string         `gorm:"not null" json:"banner_url"`
	ThumbnailURL     string         `gorm:"not null" json:"thumbnail_url"`
	Screenshots      pq.StringArray `gorm:"type:text[]" json:"screenshots"`
	Genres           pq.StringArray `gorm:"type:text[]" json:"genres"`
	DeveloperID      uint           `gorm:"index;not null" json:"developer_id"`
	DeveloperName    string         `json:"developer_name"`
	PublisherName    string         `json:"publisher_name"`
	ReleaseDate      string         `json:"release_date"`
	ReviewStatus     string         `json:"review_status"`
	ReviewCount      string         `json:"review_count"`
	MinOS            string         `json:"min_os"`
	MinProcessor     string         `json:"min_processor"`
	MinMemory        string         `json:"min_memory"`
	MinGraphics      string         `json:"min_graphics"`
	MinStorage       string         `json:"min_storage"`
	RecOS            string         `json:"rec_os"`
	RecProcessor     string         `json:"rec_processor"`
	RecMemory        string         `json:"rec_memory"`
	RecGraphics      string         `json:"rec_graphics"`
	RecStorage       string         `json:"rec_storage"`
	Status           GameStatus     `gorm:"type:varchar(20);default:'pending';not null" json:"status"`
	IsFeatured       bool           `gorm:"default:false" json:"is_featured"`
	IsPublished      bool           `gorm:"default:true" json:"is_published"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

type Review struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	GameID        uint           `gorm:"index;not null" json:"game_id"`
	UserID        uint           `gorm:"index;not null" json:"user_id"`
	AuthorName    string         `json:"author_name"`
	AuthorAvatar  string         `json:"author_avatar"`
	IsRecommended bool           `gorm:"not null" json:"is_recommended"`
	PlaytimeHours string         `json:"playtime_hours"`
	Content       string         `gorm:"type:text;not null" json:"content"`
	HelpfulCount  int            `gorm:"default:0" json:"helpful_count"`
	FunnyCount    int            `gorm:"default:0" json:"funny_count"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type CreateReviewRequest struct {
	IsRecommended bool   `json:"is_recommended"`
	PlaytimeHours string `json:"playtime_hours"`
	Content       string `json:"content" binding:"required"`
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
