package orders

import (
	"time"

	"steam-backend/internal/games"
)

type CartItem struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	UserID    uint       `gorm:"index;not null" json:"user_id"`
	GameID    uint       `gorm:"not null" json:"game_id"`
	Game      games.Game `gorm:"foreignKey:GameID" json:"game"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type UserGame struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	UserID          uint       `gorm:"uniqueIndex:idx_user_game;not null" json:"user_id"`
	GameID          uint       `gorm:"uniqueIndex:idx_user_game;not null" json:"game_id"`
	Game            games.Game `gorm:"foreignKey:GameID" json:"game"`
	PlaytimeMinutes int        `gorm:"default:0" json:"playtime_minutes"`
	LastPlayedAt    *time.Time `json:"last_played_at"`
	PurchasedAt     time.Time  `json:"purchased_at"`
}

type Order struct {
	ID          uint        `gorm:"primaryKey" json:"id"`
	UserID      uint        `gorm:"index;not null" json:"user_id"`
	OrderNumber string      `gorm:"uniqueIndex;not null" json:"order_number"`
	TotalAmount float64     `gorm:"type:decimal(10,2);not null" json:"total_amount"`
	Savings     float64     `gorm:"type:decimal(10,2);default:0" json:"savings"`
	Status      string      `gorm:"type:varchar(20);default:'completed'" json:"status"`
	Items       []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
	CreatedAt   time.Time   `json:"created_at"`
}

type OrderItem struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	OrderID   uint       `gorm:"index;not null" json:"order_id"`
	GameID    uint       `gorm:"not null" json:"game_id"`
	Game      games.Game `gorm:"foreignKey:GameID" json:"game"`
	PricePaid float64    `gorm:"type:decimal(10,2);not null" json:"price_paid"`
}

type WalletTransaction struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"index;not null" json:"user_id"`
	Amount      float64   `gorm:"type:decimal(10,2);not null" json:"amount"`
	Type        string    `gorm:"type:varchar(20);not null" json:"type"` // "deposit", "purchase", "refund"
	Description string    `gorm:"type:varchar(255)" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type CartSummaryResponse struct {
	Items    []CartItem `json:"items"`
	Subtotal float64    `json:"subtotal"`
	Savings  float64    `json:"savings"`
	Total    float64    `json:"total"`
	Count    int        `json:"count"`
}

type AddToCartRequest struct {
	GameID uint `json:"game_id" binding:"required"`
}

type DepositRequest struct {
	Amount float64 `json:"amount" binding:"required,gt=0"`
}

type CheckoutResponse struct {
	Order            Order   `json:"order"`
	RemainingBalance float64 `json:"remaining_balance"`
	Message          string  `json:"message"`
}
