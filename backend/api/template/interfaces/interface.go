package interfaces

import "web-poster-duka/backend/api/template/model"

type TemplateServiceInterface interface {
	Create(req model.TemplateCreateRequest, actor string) (model.TemplateResponse, error)
	Update(id string, req model.TemplateCreateRequest, actor string) (model.TemplateResponse, error)
	Delete(id string, actor string) error
	GetByID(id string) (model.TemplateResponse, error)
	List(limit int) ([]model.TemplateResponse, error)
}
