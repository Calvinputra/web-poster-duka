package interfaces

import "web-poster-duka/backend/api/poster/model"

type PosterServiceInterface interface {
	Create(req model.PosterCreateRequest, actor string) (model.PosterResponse, error)
	Update(id string, req model.PosterCreateRequest, actor string) (model.PosterResponse, error)
	Delete(id string, actor string) error
	GetByID(id string) (model.PosterResponse, error)
	List(limit int) ([]model.PosterResponse, error)
}
