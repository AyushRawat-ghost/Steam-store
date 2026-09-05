package auth

type Service interface {
	Register(req RegisterRequest) (AuthResponse, error)
	Login(req LoginRequest) (*AuthResponse, error)
	GetProfile(UserID uint) (*User, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}
