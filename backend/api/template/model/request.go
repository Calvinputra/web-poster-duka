package model

import "encoding/json"

type TemplateCreateRequest struct {
	Name            string          `json:"name"`
	HeaderMode      string          `json:"headerMode"`
	HeaderText      string          `json:"headerText"`
	Theme           string          `json:"theme"`
	BackgroundType  string          `json:"backgroundType"`
	BackgroundValue string          `json:"backgroundValue"`
	Layout          json.RawMessage `json:"layout"`
	Headlines       json.RawMessage `json:"headlines"`
	ThumbnailURL    string          `json:"thumbnailUrl"`
}
