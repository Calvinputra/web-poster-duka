package service

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"web-poster-duka/backend/api/poster/entity"
	"web-poster-duka/backend/api/poster/model"
	"web-poster-duka/backend/api/poster/repository"

	"gitlab.universedigital.my.id/library/golang/crud/constants"
	"gitlab.universedigital.my.id/library/golang/crud/crud"
	crudModel "gitlab.universedigital.my.id/library/golang/crud/model"
	"gorm.io/gorm"
)

type PosterService struct {
	repository *repository.PosterRepository
	crudLib    crud.LiveHisNau[entity.PosterLive]
}

func NewPosterService(repo *repository.PosterRepository) *PosterService {
	return &PosterService{
		repository: repo,
		crudLib: crud.LiveHisNau[entity.PosterLive]{
			LiveTable: entity.PosterLive{}.TableName(),
			HisTable:  entity.PosterHis{}.TableName(),
			NauCount:  0,
			DB:        repo.DB(),
		},
	}
}

func (s *PosterService) Create(req model.PosterCreateRequest, actor string) (model.PosterResponse, error) {
	if strings.TrimSpace(req.DeceasedName) == "" {
		return model.PosterResponse{}, fmt.Errorf("deceasedName is required")
	}
	if strings.TrimSpace(req.DateOfPassing) == "" {
		return model.PosterResponse{}, fmt.Errorf("dateOfPassing is required")
	}
	if strings.TrimSpace(req.ImageURL) == "" {
		return model.PosterResponse{}, fmt.Errorf("imageUrl is required")
	}
	if strings.TrimSpace(req.CondolenceMessage) == "" {
		return model.PosterResponse{}, fmt.Errorf("condolenceMessage is required")
	}

	keterangan := strings.TrimSpace(req.Keterangan)
	if keterangan == "" {
		keterangan = strings.TrimSpace(req.Title)
	}

	newPoster := entity.PosterLive{
		AuditTrail: crudModel.AuditTrail{
			Name: strings.TrimSpace(req.DeceasedName),
		},
		DeceasedName:      strings.TrimSpace(req.DeceasedName),
		Title:             keterangan,
		Keterangan:        keterangan,
		Age:               strings.TrimSpace(req.Age),
		DateOfPassing:     strings.TrimSpace(req.DateOfPassing),
		TimeOfPassing:     strings.TrimSpace(req.TimeOfPassing),
		TimeOfPassingZone: strings.TrimSpace(req.TimeOfPassingZone),
		ImageURL:          strings.TrimSpace(req.ImageURL),
		PlaceOfPassing:    strings.TrimSpace(req.PlaceOfPassing),
		PlaceLaidOut:      strings.TrimSpace(req.PlaceLaidOut),
		ProcessionType:    strings.TrimSpace(req.ProcessionType),
		ProcessionDate:    strings.TrimSpace(req.ProcessionDate),
		ProcessionTime:    strings.TrimSpace(req.ProcessionTime),
		ProcessionTZ:      strings.TrimSpace(req.ProcessionTZ),
		ProcessionPlace:   strings.TrimSpace(req.ProcessionPlace),
		MessageFrom:       strings.TrimSpace(req.MessageFrom),
		Theme:             strings.TrimSpace(req.Theme),
		FamilyData:        strings.TrimSpace(req.FamilyData),
		CondolenceMessage: strings.TrimSpace(req.CondolenceMessage),
		RelationSummary:   strings.TrimSpace(req.RelationSummary),
		DeathStatement:    strings.TrimSpace(req.DeathStatement),
	}

	tx := s.repository.DB().Begin()
	if tx.Error != nil {
		return model.PosterResponse{}, tx.Error
	}
	defer func() {
		_ = tx.Rollback()
	}()

	libResponse, live := s.crudLib.WithUuidAsRecid().Create(tx, &newPoster, actor)
	if libResponse.Err != nil {
		return model.PosterResponse{}, libResponse.Err
	}
	if libResponse.Message != constants.SuccessInsertRecord &&
		libResponse.Message != constants.SuccessInsertPrevReveRecord {
		return model.PosterResponse{}, fmt.Errorf("failed to create record: %s", libResponse.Message)
	}

	if err := tx.Commit().Error; err != nil {
		return model.PosterResponse{}, err
	}

	return toResponse(live), nil
}

func (s *PosterService) GetByID(id string) (model.PosterResponse, error) {
	poster, err := s.repository.GetLiveByID(strings.TrimSpace(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.PosterResponse{}, fmt.Errorf("poster not found")
		}
		return model.PosterResponse{}, err
	}

	return toResponse(poster), nil
}

func (s *PosterService) Update(id string, req model.PosterCreateRequest, actor string) (model.PosterResponse, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return model.PosterResponse{}, fmt.Errorf("poster id is required")
	}
	if strings.TrimSpace(req.DeceasedName) == "" {
		return model.PosterResponse{}, fmt.Errorf("deceasedName is required")
	}
	if strings.TrimSpace(req.DateOfPassing) == "" {
		return model.PosterResponse{}, fmt.Errorf("dateOfPassing is required")
	}
	if strings.TrimSpace(req.ImageURL) == "" {
		return model.PosterResponse{}, fmt.Errorf("imageUrl is required")
	}
	if strings.TrimSpace(req.CondolenceMessage) == "" {
		return model.PosterResponse{}, fmt.Errorf("condolenceMessage is required")
	}

	existing, err := s.repository.GetLiveByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.PosterResponse{}, fmt.Errorf("poster not found")
		}
		return model.PosterResponse{}, err
	}

	keterangan := strings.TrimSpace(req.Keterangan)
	if keterangan == "" {
		keterangan = strings.TrimSpace(req.Title)
	}

	updatePoster := entity.PosterLive{
		AuditTrail: crudModel.AuditTrail{
			Recid: id,
			Name:  strings.TrimSpace(req.DeceasedName),
		},
		DeceasedName:      strings.TrimSpace(req.DeceasedName),
		Title:             keterangan,
		Keterangan:        keterangan,
		Age:               strings.TrimSpace(req.Age),
		DateOfPassing:     strings.TrimSpace(req.DateOfPassing),
		TimeOfPassing:     strings.TrimSpace(req.TimeOfPassing),
		TimeOfPassingZone: strings.TrimSpace(req.TimeOfPassingZone),
		ImageURL:          strings.TrimSpace(req.ImageURL),
		PlaceOfPassing:    strings.TrimSpace(req.PlaceOfPassing),
		PlaceLaidOut:      strings.TrimSpace(req.PlaceLaidOut),
		ProcessionType:    strings.TrimSpace(req.ProcessionType),
		ProcessionDate:    strings.TrimSpace(req.ProcessionDate),
		ProcessionTime:    strings.TrimSpace(req.ProcessionTime),
		ProcessionTZ:      strings.TrimSpace(req.ProcessionTZ),
		ProcessionPlace:   strings.TrimSpace(req.ProcessionPlace),
		MessageFrom:       strings.TrimSpace(req.MessageFrom),
		Theme:             strings.TrimSpace(req.Theme),
		FamilyData:        strings.TrimSpace(req.FamilyData),
		CondolenceMessage: strings.TrimSpace(req.CondolenceMessage),
		RelationSummary:   strings.TrimSpace(req.RelationSummary),
		DeathStatement:    strings.TrimSpace(req.DeathStatement),
	}

	tx := s.repository.DB().Begin()
	if tx.Error != nil {
		return model.PosterResponse{}, tx.Error
	}
	defer func() { _ = tx.Rollback() }()

	libResponse, updated := s.crudLib.WithCustomCurrNo(existing.CurrNo).Update(tx, &updatePoster, actor)
	if libResponse.Err != nil {
		return model.PosterResponse{}, libResponse.Err
	}
	if libResponse.Message != constants.SuccessUpdateRecord {
		return model.PosterResponse{}, fmt.Errorf("failed to update record: %s", libResponse.Message)
	}

	if err := tx.Commit().Error; err != nil {
		return model.PosterResponse{}, err
	}

	return toResponse(updated), nil
}

func (s *PosterService) Delete(id string, actor string) error {
	id = strings.TrimSpace(id)
	if id == "" {
		return fmt.Errorf("poster id is required")
	}
	if strings.TrimSpace(actor) == "" {
		actor = "web-user"
	}

	tx := s.repository.DB().Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer func() { _ = tx.Rollback() }()

	libResponse, _ := s.crudLib.DeleteLive(tx, id, actor)
	if libResponse.Err != nil {
		return libResponse.Err
	}
	if libResponse.Message != constants.SuccessDeleteRecord {
		return fmt.Errorf("failed to delete record: %s", libResponse.Message)
	}

	return tx.Commit().Error
}

func (s *PosterService) List(limit int) ([]model.PosterResponse, error) {
	if limit <= 0 {
		limit = 50
	}

	posters, err := s.repository.ListLive(limit)
	if err != nil {
		return nil, err
	}

	response := make([]model.PosterResponse, 0, len(posters))
	for _, poster := range posters {
		response = append(response, toResponse(poster))
	}

	return response, nil
}

func toResponse(poster entity.PosterLive) model.PosterResponse {
	deceasedName := poster.DeceasedName
	if strings.TrimSpace(deceasedName) == "" {
		deceasedName = poster.Name
	}

	keterangan := strings.TrimSpace(poster.Keterangan)
	if keterangan == "" {
		keterangan = strings.TrimSpace(poster.Title)
	}

	return model.PosterResponse{
		ID:                poster.Recid,
		DeceasedName:      deceasedName,
		Title:             keterangan,
		Keterangan:        keterangan,
		Age:               poster.Age,
		DateOfPassing:     poster.DateOfPassing,
		TimeOfPassing:     poster.TimeOfPassing,
		TimeOfPassingZone: poster.TimeOfPassingZone,
		ImageURL:          poster.ImageURL,
		PlaceOfPassing:    poster.PlaceOfPassing,
		PlaceLaidOut:      poster.PlaceLaidOut,
		ProcessionType:    poster.ProcessionType,
		ProcessionDate:    poster.ProcessionDate,
		ProcessionTime:    poster.ProcessionTime,
		ProcessionTZ:      poster.ProcessionTZ,
		ProcessionPlace:   poster.ProcessionPlace,
		MessageFrom:       poster.MessageFrom,
		Theme:             poster.Theme,
		FamilyData:        poster.FamilyData,
		CondolenceMessage: poster.CondolenceMessage,
		RelationSummary:   poster.RelationSummary,
		DeathStatement:    poster.DeathStatement,
		CreatedAt:         time.UnixMilli(poster.CreatedDateTime),
		CreatedDateTime:   time.UnixMilli(poster.CreatedDateTime),
		UpdateDateTime:    time.UnixMilli(lastUpdateMillis(poster.CreatedDateTime, poster.InputDateTime)),
	}
}

func lastUpdateMillis(createdDateTime int64, inputDateTime int64) int64 {
	if inputDateTime > 0 {
		return inputDateTime
	}
	return createdDateTime
}
