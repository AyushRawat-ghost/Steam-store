package orders

import (
	"errors"
	"math"

	"steam-backend/internal/auth"
	"steam-backend/internal/games"
)

type Service interface {
	GetCart(userID uint) (*CartSummaryResponse, error)
	AddToCart(userID, gameID uint) error
	RemoveFromCart(userID, gameID uint) error
	ClearCart(userID uint) error

	GetUserLibrary(userID uint) ([]UserGame, error)

	GetWallet(userID uint) (*auth.User, []WalletTransaction, error)
	DepositFunds(userID uint, amount float64) (*auth.User, error)

	Checkout(userID uint) (*CheckoutResponse, error)
}

type service struct {
	repo      Repository
	gamesRepo games.Repository
}

func NewService(repo Repository, gamesRepo games.Repository) Service {
	return &service{
		repo:      repo,
		gamesRepo: gamesRepo,
	}
}

func (s *service) GetCart(userID uint) (*CartSummaryResponse, error) {
	items, err := s.repo.GetCartItems(userID)
	if err != nil {
		return nil, err
	}

	var subtotal, savings, total float64
	for _, it := range items {
		price := it.Game.Price
		subtotal += price
		if it.Game.DiscountPercent > 0 {
			discounted := price * (1.0 - float64(it.Game.DiscountPercent)/100.0)
			savings += (price - discounted)
			total += discounted
		} else {
			total += price
		}
	}

	return &CartSummaryResponse{
		Items:    items,
		Subtotal: math.Round(subtotal*100) / 100,
		Savings:  math.Round(savings*100) / 100,
		Total:    math.Round(total*100) / 100,
		Count:    len(items),
	}, nil
}

func (s *service) AddToCart(userID, gameID uint) error {
	// 1. Verify game exists
	game, err := s.gamesRepo.FindByID(gameID)
	if err != nil || game == nil {
		return errors.New("game not found")
	}

	// 2. Check if user already owns this game
	isOwned, err := s.repo.IsGameOwned(userID, gameID)
	if err != nil {
		return err
	}
	if isOwned {
		return errors.New("you already own this game in your Steam Library")
	}

	// 3. Check if already in cart
	existing, err := s.repo.GetCartItem(userID, gameID)
	if err != nil {
		return err
	}
	if existing != nil {
		return errors.New("game is already in your cart")
	}

	// 4. Add to cart
	item := CartItem{
		UserID: userID,
		GameID: gameID,
	}
	return s.repo.AddToCart(&item)
}

func (s *service) RemoveFromCart(userID, gameID uint) error {
	return s.repo.RemoveFromCart(userID, gameID)
}

func (s *service) ClearCart(userID uint) error {
	return s.repo.ClearCart(userID)
}

func (s *service) GetUserLibrary(userID uint) ([]UserGame, error) {
	return s.repo.GetUserLibrary(userID)
}

func (s *service) GetWallet(userID uint) (*auth.User, []WalletTransaction, error) {
	return s.repo.GetUserWallet(userID)
}

func (s *service) DepositFunds(userID uint, amount float64) (*auth.User, error) {
	if amount <= 0 {
		return nil, errors.New("deposit amount must be greater than zero")
	}
	if amount > 10000 {
		return nil, errors.New("single deposit limit is $10,000.00 USD")
	}
	return s.repo.DepositFunds(userID, amount)
}

func (s *service) Checkout(userID uint) (*CheckoutResponse, error) {
	return s.repo.CheckoutCart(userID)
}
