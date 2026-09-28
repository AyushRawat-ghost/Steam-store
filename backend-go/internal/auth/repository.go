package auth

import (
	"errors"

	"gorm.io/gorm"
)

type Repository interface {
	CreateUser(user *User) error
	GetUserByEmail(email string) (*User, error)
	GetUserByUsername(username string) (*User, error)
	GetUserById(id uint) (*User, error)
	EmailOrUsernameExists(email, username string) (bool, error)
	GetPendingDevelopers() ([]User, error)
	VerifyDeveloper(id uint) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) CreateUser(user *User) error {
	return r.db.Create(user).Error
}

func (r *repository) GetUserByEmail(email string) (*User, error) {
	var user User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *repository) GetUserByUsername(username string) (*User, error) {
	var user User
	err := r.db.Where("username = ?", username).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *repository) GetUserById(id uint) (*User, error) {
	var user User
	err := r.db.Where("id = ?", id).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *repository) EmailOrUsernameExists(email, username string) (bool, error) {
	var count int64
	err := r.db.Model(&User{}).Where("email = ? OR username = ?", email, username).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *repository) GetPendingDevelopers() ([]User, error) {
	var users []User
	err := r.db.Where("role = ? AND is_verified = ?", RoleDeveloper, false).Find(&users).Error
	return users, err
}

func (r *repository) VerifyDeveloper(id uint) error {
	return r.db.Model(&User{}).Where("id = ?", id).Updates(map[string]interface{}{
		"is_verified": true,
		"status":      "active",
	}).Error
}

