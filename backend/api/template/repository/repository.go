package repository

import (
	"web-poster-duka/backend/api/template/entity"

	"gorm.io/gorm"
)

type TemplateRepository struct {
	db *gorm.DB
}

func NewTemplateRepository(db *gorm.DB) *TemplateRepository {
	return &TemplateRepository{db: db}
}

func (r *TemplateRepository) Migrate() error {
	return r.db.AutoMigrate(&entity.TemplateLive{}, &entity.TemplateHis{})
}

func (r *TemplateRepository) DB() *gorm.DB {
	return r.db
}

func (r *TemplateRepository) GetLiveByID(id string) (entity.TemplateLive, error) {
	var template entity.TemplateLive
	err := r.db.Table(entity.TemplateLive{}.TableName()).
		Where("recid = ? AND record_status = ?", id, "LIVE").
		Take(&template).Error
	return template, err
}

func (r *TemplateRepository) ListLive(limit int) ([]entity.TemplateLive, error) {
	templates := make([]entity.TemplateLive, 0)
	err := r.db.Table(entity.TemplateLive{}.TableName()).
		Where("record_status = ?", "LIVE").
		Order("created_datetime DESC").
		Limit(limit).
		Find(&templates).Error
	if err != nil {
		return nil, err
	}
	return templates, nil
}
