package auth

import (
	"errors"
	"steam-backend/pkg/jwt"
)

type Service interface {
	Register(req RegisterRequest) (AuthResponse, error)
	Login(req LoginRequest) (*AuthResponse, error)
	GetProfile(UserID uint) (*User, error)
	GetPendingDevelopers() ([]User, error)
	VerifyDeveloper(id uint) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) Register(req RegisterRequest) (AuthResponse, error) {
	exists, err := s.repo.EmailOrUsernameExists(req.Email, req.Username)
	if err != nil {
		return AuthResponse{}, err
	}
	if exists {
		return AuthResponse{}, errors.New("Email or username already exists")
	}
	role := req.Role
	if role != RoleAdmin && role != RoleDeveloper && role != RoleGamer {
		role = RoleGamer
	}
	isVerified := true
	status := "active"

	if req.Role == RoleDeveloper {
		isVerified = false
		status = "pending"
	}
	hashedPassword, err := jwt.HashPassword(req.Password)
	if err != nil {
		return AuthResponse{}, err
	}
	user := User{
		Email:         req.Email,
		PasswordHash:  hashedPassword,
		Username:      req.Username,
		Role:          role,
		IsVerified:    isVerified,
		Status:        status,
		WalletBalance: 100.00,
	}
	if err := s.repo.CreateUser(&user); err != nil {
		return AuthResponse{}, err
	}
	token, err := jwt.GenerateToken(user.ID, user.Username, string(user.Role))
	if err != nil {
		return AuthResponse{}, err
	}
	return AuthResponse{
		User:  user,
		Token: token,
	}, nil
}

func (s *service) Login(req LoginRequest) (*AuthResponse, error) {
	user, err := s.repo.GetUserByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
	}
	if !jwt.CheckPasswordHash(req.Password, user.PasswordHash) {
		return nil, errors.New("invalid password")
	}
	token, err := jwt.GenerateToken(user.ID, user.Username, string(user.Role))
	if err != nil {
		return nil, err
	}
	return &AuthResponse{
		User:  *user,
		Token: token,
	}, nil
}

func (s *service) GetProfile(UserID uint) (*User, error) {
	user, err := s.repo.GetUserById(UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (s *service) GetPendingDevelopers() ([]User, error) {
	return s.repo.GetPendingDevelopers()
}

func (s *service) VerifyDeveloper(id uint) error {
	return s.repo.VerifyDeveloper(id)
}
