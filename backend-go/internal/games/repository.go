package games

import "gorm.io/gorm"

type Repository interface {
	Create(game *Game) error
	FindByID(id uint) (*Game, error)
	FindBySlug(slug string) (*Game, error)
	FindAll(genre, search string, page, limit int) ([]Game, error)
	FindFeatured() ([]Game, error)
	FindByDeveloper(devID uint) ([]Game, error)
	Update(game *Game) error
	Delete(id uint) error
	AdminFindAll(page, limit int) ([]Game, error)
	UpdateStatus(id uint, status GameStatus, isFeatured *bool) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(game *Game) error {
	return r.db.Create(game).Error
}

func (r *repository) FindByID(id uint) (*Game, error) {
	var game Game
	if err := r.db.First(&game, id).Error; err != nil {
		return nil, err
	}
	return &game, nil
}

func (r *repository) FindBySlug(slug string) (*Game, error) {
	var game Game
	if err := r.db.Where("slug = ?", slug).First(&game).Error; err != nil {
		return nil, err
	}
	return &game, nil
}

func (r *repository) FindAll(genre, search string, page, limit int) ([]Game, error) {
	var games []Game
	db := r.db.Where("status = ?", StatusApproved).Where("is_published = true")
	if genre != "" {
		db = db.Where("? = ANY(genres)", genre)
	}
	if search != "" {
		db = db.Where("title ILIKE ?", "%"+search+"%")
	}
	offset := (page - 1) * limit
	err := db.Offset(offset).Limit(limit).Find(&games).Error
	return games, err
}

func (r *repository) FindFeatured() ([]Game, error) {
	var games []Game
	if err := r.db.Where("status = ?", StatusApproved).Where("is_featured = true").Where("is_published = true").Limit(5).Find(&games).Error; err != nil {
		return nil, err
	}
	return games, nil
}

func (r *repository) FindByDeveloper(devID uint) ([]Game, error) {
	var games []Game
	if err := r.db.Where("developer_id = ?", devID).Find(&games).Error; err != nil {
		return nil, err
	}
	return games, nil
}

func (r *repository) Update(game *Game) error {
	return r.db.Save(game).Error
}

func (r *repository) Delete(id uint) error {
	return r.db.Delete(&Game{}, id).Error
}

func (r *repository) AdminFindAll(page, limit int) ([]Game, error) {
	var games []Game
	db := r.db
	offset := (page - 1) * limit
	err := db.Offset(offset).Limit(limit).Find(&games).Error
	return games, err
}

func (r *repository) UpdateStatus(id uint, status GameStatus, isFeatured *bool) error {
	updateData := map[string]interface{}{
		"status": status,
	}
	if isFeatured != nil {
		updateData["is_featured"] = *isFeatured
	}
	return r.db.Model(&Game{}).Where("id = ?", id).Updates(updateData).Error
}
