package games

import (
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"
)

type Service interface {
	CreateGame(req CreateGameRequest, devID uint) (*Game, error)
	GetGames(genre, search string, page, limit int) ([]Game, error)
	GetFeaturedGames() ([]Game, error)
	GetGame(idOrSlug string) (*Game, error)
	GetGameByID(id uint) (*Game, error)
	GetDeveloperGames(devID uint) ([]Game, error)
	UpdateDeveloperGame(id, devID uint, req UpdateGameRequest) (*Game, error)
	DeleteDeveloperGame(id, devID uint) error
	AdminGetAllGames(page, limit int) ([]Game, error)
	AdminUpdateStatus(id uint, status GameStatus, isFeatured *bool) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func slugify(title string) string {
	slug := strings.ToLower(title)
	reg := regexp.MustCompile("[^a-z0-9]+")
	slug = reg.ReplaceAllString(slug, "-")
	return strings.Trim(slug, "-")
}

func (s *service) CreateGame(req CreateGameRequest, devID uint) (*Game, error) {
	slug := fmt.Sprintf("%s-%d", slugify(req.Title), time.Now().Unix()%10000)

	game := Game{
		Title:            req.Title,
		Slug:             slug,
		ShortDescription: req.ShortDescription,
		Description:      req.Description,
		Price:            req.Price,
		DiscountPercent:  req.DiscountPercent,
		BannerURL:        req.BannerURL,
		ThumbnailURL:     req.ThumbnailURL,
		Screenshots:      req.Screenshots,
		Genres:           req.Genres,
		DeveloperID:      devID,
		Status:           StatusPending,
		IsFeatured:       false,
		IsPublished:      req.IsPublished,
	}

	if err := s.repo.Create(&game); err != nil {
		return nil, err
	}

	return &game, nil
}

func (s *service) GetGames(genre, search string, page, limit int) ([]Game, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	return s.repo.FindAll(genre, search, page, limit)
}

func (s *service) GetFeaturedGames() ([]Game, error) {
	return s.repo.FindFeatured()
}

func (s *service) GetGame(idOrSlug string) (*Game, error) {
	if id, err := strconv.ParseUint(idOrSlug, 10, 32); err == nil {
		game, err := s.repo.FindByID(uint(id))
		if err == nil && game != nil {
			return game, nil
		}
	}
	return s.repo.FindBySlug(idOrSlug)
}

func (s *service) GetGameByID(id uint) (*Game, error) {
	return s.repo.FindByID(id)
}

func (s *service) GetDeveloperGames(devID uint) ([]Game, error) {
	return s.repo.FindByDeveloper(devID)
}

func (s *service) UpdateDeveloperGame(id, devID uint, req UpdateGameRequest) (*Game, error) {
	game, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if game.DeveloperID != devID {
		return nil, errors.New("unauthorized: you do not own this game")
	}

	if req.Title != "" {
		game.Title = req.Title
		game.Slug = fmt.Sprintf("%s-%d", slugify(req.Title), game.ID)
	}
	if req.ShortDescription != "" {
		game.ShortDescription = req.ShortDescription
	}
	if req.Description != "" {
		game.Description = req.Description
	}
	if req.Price != nil {
		game.Price = *req.Price
	}
	if req.DiscountPercent != nil {
		game.DiscountPercent = *req.DiscountPercent
	}
	if req.BannerURL != "" {
		game.BannerURL = req.BannerURL
	}
	if req.ThumbnailURL != "" {
		game.ThumbnailURL = req.ThumbnailURL
	}
	if req.Screenshots != nil {
		game.Screenshots = req.Screenshots
	}
	if req.Genres != nil {
		game.Genres = req.Genres
	}
	if req.IsPublished != nil {
		game.IsPublished = *req.IsPublished
	}

	if err := s.repo.Update(game); err != nil {
		return nil, err
	}
	return game, nil
}

func (s *service) DeleteDeveloperGame(id, devID uint) error {
	game, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	if game.DeveloperID != devID {
		return errors.New("unauthorized: you do not own this game")
	}
	return s.repo.Delete(id)
}

func (s *service) AdminGetAllGames(page, limit int) ([]Game, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	return s.repo.AdminFindAll(page, limit)
}

func (s *service) AdminUpdateStatus(id uint, status GameStatus, isFeatured *bool) error {
	return s.repo.UpdateStatus(id, status, isFeatured)
}
