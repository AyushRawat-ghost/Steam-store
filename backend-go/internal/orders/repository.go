package orders

import (
	"errors"
	"fmt"
	"math"
	"math/rand"
	"time"

	"steam-backend/internal/auth"

	"gorm.io/gorm"
)

type Repository interface {
	GetCartItems(userID uint) ([]CartItem, error)
	GetCartItem(userID, gameID uint) (*CartItem, error)
	AddToCart(item *CartItem) error
	RemoveFromCart(userID, gameID uint) error
	ClearCart(userID uint) error

	GetUserLibrary(userID uint) ([]UserGame, error)
	IsGameOwned(userID, gameID uint) (bool, error)

	GetUserWallet(userID uint) (*auth.User, []WalletTransaction, error)
	DepositFunds(userID uint, amount float64) (*auth.User, error)

	CheckoutCart(userID uint) (*CheckoutResponse, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetCartItems(userID uint) ([]CartItem, error) {
	var items []CartItem
	err := r.db.Preload("Game").Where("user_id = ?", userID).Find(&items).Error
	return items, err
}

func (r *repository) GetCartItem(userID, gameID uint) (*CartItem, error) {
	var item CartItem
	err := r.db.Where("user_id = ? AND game_id = ?", userID, gameID).First(&item).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &item, nil
}

func (r *repository) AddToCart(item *CartItem) error {
	return r.db.Create(item).Error
}

func (r *repository) RemoveFromCart(userID, gameID uint) error {
	return r.db.Where("user_id = ? AND game_id = ?", userID, gameID).Delete(&CartItem{}).Error
}

func (r *repository) ClearCart(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&CartItem{}).Error
}

func (r *repository) GetUserLibrary(userID uint) ([]UserGame, error) {
	var library []UserGame
	err := r.db.Preload("Game").Where("user_id = ?", userID).Order("purchased_at desc").Find(&library).Error
	return library, err
}

func (r *repository) IsGameOwned(userID, gameID uint) (bool, error) {
	var count int64
	err := r.db.Model(&UserGame{}).Where("user_id = ? AND game_id = ?", userID, gameID).Count(&count).Error
	return count > 0, err
}

func (r *repository) GetUserWallet(userID uint) (*auth.User, []WalletTransaction, error) {
	var user auth.User
	if err := r.db.First(&user, userID).Error; err != nil {
		return nil, nil, err
	}
	var txs []WalletTransaction
	err := r.db.Where("user_id = ?", userID).Order("created_at desc").Limit(20).Find(&txs).Error
	return &user, txs, err
}

func (r *repository) DepositFunds(userID uint, amount float64) (*auth.User, error) {
	var user auth.User
	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&user, userID).Error; err != nil {
			return err
		}
		user.WalletBalance += amount
		if err := tx.Save(&user).Error; err != nil {
			return err
		}
		txRecord := WalletTransaction{
			UserID:      userID,
			Amount:      amount,
			Type:        "deposit",
			Description: fmt.Sprintf("Steam Wallet Top-up: +$%.2f USD", amount),
			CreatedAt:   time.Now(),
		}
		return tx.Create(&txRecord).Error
	})
	return &user, err
}

func generateOrderNumber() string {
	chars := "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	b := make([]byte, 8)
	for i := range b {
		b[i] = chars[rand.Intn(len(chars))]
	}
	return fmt.Sprintf("STM-%s-%s", string(b[:4]), string(b[4:]))
}

func (r *repository) CheckoutCart(userID uint) (*CheckoutResponse, error) {
	var response CheckoutResponse

	err := r.db.Transaction(func(tx *gorm.DB) error {
		// 1. Fetch Cart
		var items []CartItem
		if err := tx.Preload("Game").Where("user_id = ?", userID).Find(&items).Error; err != nil {
			return err
		}
		if len(items) == 0 {
			return errors.New("your cart is empty")
		}

		// 2. Calculate Total & Savings
		var totalAmount, totalSavings float64
		for _, it := range items {
			price := it.Game.Price
			if it.Game.DiscountPercent > 0 {
				discounted := price * (1.0 - float64(it.Game.DiscountPercent)/100.0)
				savings := price - discounted
				totalAmount += discounted
				totalSavings += savings
			} else {
				totalAmount += price
			}
		}

		// Round to 2 decimal places
		totalAmount = math.Round(totalAmount*100) / 100
		totalSavings = math.Round(totalSavings*100) / 100

		// 3. Fetch User & Check Balance
		var user auth.User
		if err := tx.First(&user, userID).Error; err != nil {
			return err
		}

		if user.WalletBalance < totalAmount {
			return fmt.Errorf("insufficient wallet balance: required $%.2f, current balance $%.2f", totalAmount, user.WalletBalance)
		}

		// 4. Deduct User Wallet
		user.WalletBalance -= totalAmount
		if err := tx.Save(&user).Error; err != nil {
			return err
		}

		// 5. Create Order
		order := Order{
			UserID:      userID,
			OrderNumber: generateOrderNumber(),
			TotalAmount: totalAmount,
			Savings:     totalSavings,
			Status:      "completed",
			CreatedAt:   time.Now(),
		}
		if err := tx.Create(&order).Error; err != nil {
			return err
		}

		// 6. Create OrderItems & Grant Library Access
		var orderItems []OrderItem
		for _, it := range items {
			effectivePrice := it.Game.Price
			if it.Game.DiscountPercent > 0 {
				effectivePrice = math.Round(it.Game.Price*(1.0-float64(it.Game.DiscountPercent)/100.0)*100) / 100
			}

			orderItem := OrderItem{
				OrderID:   order.ID,
				GameID:    it.GameID,
				PricePaid: effectivePrice,
			}
			if err := tx.Create(&orderItem).Error; err != nil {
				return err
			}
			orderItems = append(orderItems, orderItem)

			// Grant game to UserGame (skip if already owned)
			var userGame UserGame
			findErr := tx.Where("user_id = ? AND game_id = ?", userID, it.GameID).First(&userGame).Error
			if errors.Is(findErr, gorm.ErrRecordNotFound) {
				newLicense := UserGame{
					UserID:          userID,
					GameID:          it.GameID,
					PlaytimeMinutes: 0,
					PurchasedAt:     time.Now(),
				}
				if err := tx.Create(&newLicense).Error; err != nil {
					return err
				}
			}
		}
		order.Items = orderItems

		// 7. Record Wallet Transaction
		walletTx := WalletTransaction{
			UserID:      userID,
			Amount:      -totalAmount,
			Type:        "purchase",
			Description: fmt.Sprintf("Steam Store Purchase: Order %s (%d items)", order.OrderNumber, len(items)),
			CreatedAt:   time.Now(),
		}
		if err := tx.Create(&walletTx).Error; err != nil {
			return err
		}

		// 8. Clear Cart
		if err := tx.Where("user_id = ?", userID).Delete(&CartItem{}).Error; err != nil {
			return err
		}

		response = CheckoutResponse{
			Order:            order,
			RemainingBalance: user.WalletBalance,
			Message:          fmt.Sprintf("Payment successful! %d games added to your Steam Library.", len(items)),
		}

		return nil
	})

	if err != nil {
		return nil, err
	}
	return &response, nil
}
