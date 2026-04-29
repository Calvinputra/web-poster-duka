package repository

import (
	"fmt"
	"web-poster-duka/backend/api/poster/entity"

	"gorm.io/gorm"
)

type PosterRepository struct {
	db *gorm.DB
}

func NewPosterRepository(db *gorm.DB) *PosterRepository {
	return &PosterRepository{db: db}
}

func (r *PosterRepository) Migrate() error {
	if err := r.db.AutoMigrate(&entity.PosterLive{}, &entity.PosterHis{}); err != nil {
		return err
	}

	columns := []string{
		"Keterangan",
		"TimeOfPassing",
		"TimeOfPassingZone",
		"PlaceLaidOut",
		"ProcessionType",
		"ProcessionDate",
		"ProcessionTime",
		"ProcessionTZ",
		"ProcessionPlace",
		"Theme",
		"FamilyData",
		"RelationSummary",
		"DeathStatement",
	}
	for _, column := range columns {
		if !r.db.Migrator().HasColumn(&entity.PosterLive{}, column) {
			if err := r.db.Migrator().AddColumn(&entity.PosterLive{}, column); err != nil {
				return fmt.Errorf("add live column %s: %w", column, err)
			}
		}
		if !r.db.Migrator().HasColumn(&entity.PosterHis{}, column) {
			if err := r.db.Migrator().AddColumn(&entity.PosterHis{}, column); err != nil {
				return fmt.Errorf("add history column %s: %w", column, err)
			}
		}
	}

	legacyColumns := []string{"OrganizationName", "OrganizationLogo"}
	for _, column := range legacyColumns {
		if r.db.Migrator().HasColumn(&entity.PosterLive{}, column) {
			if err := r.db.Migrator().DropColumn(&entity.PosterLive{}, column); err != nil {
				return fmt.Errorf("drop live column %s: %w", column, err)
			}
		}
		if r.db.Migrator().HasColumn(&entity.PosterHis{}, column) {
			if err := r.db.Migrator().DropColumn(&entity.PosterHis{}, column); err != nil {
				return fmt.Errorf("drop history column %s: %w", column, err)
			}
		}
	}
	return nil
}

func (r *PosterRepository) DB() *gorm.DB {
	return r.db
}

func (r *PosterRepository) GetLiveByID(id string) (entity.PosterLive, error) {
	var poster entity.PosterLive
	err := r.db.Table(entity.PosterLive{}.TableName()).
		Where("recid = ? AND record_status = ?", id, "LIVE").
		Take(&poster).Error
	return poster, err
}

func (r *PosterRepository) ListLive(limit int) ([]entity.PosterLive, error) {
	posters := make([]entity.PosterLive, 0)
	err := r.db.Table(entity.PosterLive{}.TableName()).
		Where("record_status = ?", "LIVE").
		Order("created_datetime DESC").
		Limit(limit).
		Find(&posters).Error
	if err != nil {
		return nil, err
	}
	return posters, nil
}
