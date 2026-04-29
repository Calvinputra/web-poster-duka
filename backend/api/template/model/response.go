package model

import (
	"encoding/json"
	"time"
)

type TemplateResponse struct {
	ID              string          `json:"id"`
	Name            string          `json:"name"`
	HeaderMode      string          `json:"headerMode"`
	HeaderText      string          `json:"headerText"`
	Theme           string          `json:"theme"`
	BackgroundType  string          `json:"backgroundType"`
	BackgroundValue string          `json:"backgroundValue"`
	Layout          json.RawMessage `json:"layout"`
	Headlines       json.RawMessage `json:"headlines"`
	ThumbnailURL    string          `json:"thumbnailUrl"`
	CreatedAt       time.Time       `json:"createdAt"`
	CreatedDateTime time.Time       `json:"createdDateTime"`
	UpdateDateTime  time.Time       `json:"updateDateTime"`
}

type APIResponse[T any] struct {
	Message string `json:"message"`
	Data    T      `json:"data"`
}
