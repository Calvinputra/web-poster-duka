package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"web-poster-duka/backend/api/template/entity"
	"web-poster-duka/backend/api/template/model"
	"web-poster-duka/backend/api/template/repository"

	"gitlab.universedigital.my.id/library/golang/crud/constants"
	"gitlab.universedigital.my.id/library/golang/crud/crud"
	crudModel "gitlab.universedigital.my.id/library/golang/crud/model"
	"gorm.io/gorm"
)

type TemplateService struct {
	repository *repository.TemplateRepository
	crudLib    crud.LiveHisNau[entity.TemplateLive]
}

func NewTemplateService(repo *repository.TemplateRepository) *TemplateService {
	return &TemplateService{
		repository: repo,
		crudLib: crud.LiveHisNau[entity.TemplateLive]{
			LiveTable: entity.TemplateLive{}.TableName(),
			HisTable:  entity.TemplateHis{}.TableName(),
			NauCount:  0,
			DB:        repo.DB(),
		},
	}
}

func (s *TemplateService) Create(req model.TemplateCreateRequest, actor string) (model.TemplateResponse, error) {
	if strings.TrimSpace(req.Name) == "" {
		return model.TemplateResponse{}, fmt.Errorf("name is required")
	}

	newTemplate := entity.TemplateLive{
		AuditTrail: crudModel.AuditTrail{
			Name: strings.TrimSpace(req.Name),
		},
		TemplateName:     strings.TrimSpace(req.Name),
		HeaderMode:       strings.TrimSpace(req.HeaderMode),
		HeaderText:       strings.TrimSpace(req.HeaderText),
		Theme:            strings.TrimSpace(req.Theme),
		BackgroundType:   strings.TrimSpace(req.BackgroundType),
		BackgroundValue:  strings.TrimSpace(req.BackgroundValue),
		LayoutJSON:       string(req.Layout),
		HeadlinesJSON:    string(req.Headlines),
		ThumbnailDataURL: strings.TrimSpace(req.ThumbnailURL),
	}

	tx := s.repository.DB().Begin()
	if tx.Error != nil {
		return model.TemplateResponse{}, tx.Error
	}
	defer func() { _ = tx.Rollback() }()

	libResponse, created := s.crudLib.WithUuidAsRecid().Create(tx, &newTemplate, actor)
	if libResponse.Err != nil {
		return model.TemplateResponse{}, libResponse.Err
	}
	if libResponse.Message != constants.SuccessInsertRecord &&
		libResponse.Message != constants.SuccessInsertPrevReveRecord {
		return model.TemplateResponse{}, fmt.Errorf("failed to create record: %s", libResponse.Message)
	}

	if err := tx.Commit().Error; err != nil {
		return model.TemplateResponse{}, err
	}

	return toResponse(created), nil
}

func (s *TemplateService) GetByID(id string) (model.TemplateResponse, error) {
	template, err := s.repository.GetLiveByID(strings.TrimSpace(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.TemplateResponse{}, fmt.Errorf("template not found")
		}
		return model.TemplateResponse{}, err
	}

	return toResponse(template), nil
}

func (s *TemplateService) Update(id string, req model.TemplateCreateRequest, actor string) (model.TemplateResponse, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return model.TemplateResponse{}, fmt.Errorf("template id is required")
	}
	if strings.TrimSpace(req.Name) == "" {
		return model.TemplateResponse{}, fmt.Errorf("name is required")
	}

	existing, err := s.repository.GetLiveByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.TemplateResponse{}, fmt.Errorf("template not found")
		}
		return model.TemplateResponse{}, err
	}

	updateTemplate := entity.TemplateLive{
		AuditTrail: crudModel.AuditTrail{
			Recid: id,
			Name:  strings.TrimSpace(req.Name),
		},
		TemplateName:     strings.TrimSpace(req.Name),
		HeaderMode:       strings.TrimSpace(req.HeaderMode),
		HeaderText:       strings.TrimSpace(req.HeaderText),
		Theme:            strings.TrimSpace(req.Theme),
		BackgroundType:   strings.TrimSpace(req.BackgroundType),
		BackgroundValue:  strings.TrimSpace(req.BackgroundValue),
		LayoutJSON:       string(req.Layout),
		HeadlinesJSON:    string(req.Headlines),
		ThumbnailDataURL: strings.TrimSpace(req.ThumbnailURL),
	}

	tx := s.repository.DB().Begin()
	if tx.Error != nil {
		return model.TemplateResponse{}, tx.Error
	}
	defer func() { _ = tx.Rollback() }()

	libResponse, updated := s.crudLib.WithCustomCurrNo(existing.CurrNo).Update(tx, &updateTemplate, actor)
	if libResponse.Err != nil {
		return model.TemplateResponse{}, libResponse.Err
	}
	if libResponse.Message != constants.SuccessUpdateRecord {
		return model.TemplateResponse{}, fmt.Errorf("failed to update record: %s", libResponse.Message)
	}

	if err := tx.Commit().Error; err != nil {
		return model.TemplateResponse{}, err
	}

	return toResponse(updated), nil
}

func (s *TemplateService) Delete(id string, actor string) error {
	id = strings.TrimSpace(id)
	if id == "" {
		return fmt.Errorf("template id is required")
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

func (s *TemplateService) List(limit int) ([]model.TemplateResponse, error) {
	if limit <= 0 {
		limit = 50
	}

	templates, err := s.repository.ListLive(limit)
	if err != nil {
		return nil, err
	}

	response := make([]model.TemplateResponse, 0, len(templates))
	for _, template := range templates {
		response = append(response, toResponse(template))
	}

	return response, nil
}

func toResponse(template entity.TemplateLive) model.TemplateResponse {
	return model.TemplateResponse{
		ID:              template.Recid,
		Name:            firstFilled(template.TemplateName, template.Name),
		HeaderMode:      firstFilled(template.HeaderMode, "headline"),
		HeaderText:      firstFilled(template.HeaderText, "IN MEMORIAM"),
		Theme:           firstFilled(template.Theme, "elegant-night"),
		BackgroundType:  firstFilled(template.BackgroundType, "theme"),
		BackgroundValue: template.BackgroundValue,
		Layout:          parseRawJSON(template.LayoutJSON, []byte("{}")),
		Headlines:       parseRawJSON(template.HeadlinesJSON, []byte("[]")),
		ThumbnailURL:    template.ThumbnailDataURL,
		CreatedAt:       time.UnixMilli(template.CreatedDateTime),
		CreatedDateTime: time.UnixMilli(template.CreatedDateTime),
		UpdateDateTime:  time.UnixMilli(lastUpdateMillis(template.CreatedDateTime, template.InputDateTime)),
	}
}

func parseRawJSON(value string, fallback []byte) json.RawMessage {
	if strings.TrimSpace(value) == "" {
		return json.RawMessage(fallback)
	}
	return json.RawMessage([]byte(value))
}

func firstFilled(primary string, fallback string) string {
	if strings.TrimSpace(primary) == "" {
		return fallback
	}
	return primary
}

func lastUpdateMillis(createdDateTime int64, inputDateTime int64) int64 {
	if inputDateTime > 0 {
		return inputDateTime
	}
	return createdDateTime
}
