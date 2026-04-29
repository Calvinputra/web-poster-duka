package entity

import crudModel "gitlab.universedigital.my.id/library/golang/crud/model"

type TemplateLive struct {
	crudModel.AuditTrail
	TemplateName     string `gorm:"column:template_name" json:"templateName"`
	HeaderMode       string `gorm:"column:header_mode" json:"headerMode"`
	HeaderText       string `gorm:"column:header_text" json:"headerText"`
	Theme            string `gorm:"column:theme" json:"theme"`
	BackgroundType   string `gorm:"column:background_type" json:"backgroundType"`
	BackgroundValue  string `gorm:"column:background_value" json:"backgroundValue"`
	LayoutJSON       string `gorm:"column:layout_json" json:"layoutJson"`
	HeadlinesJSON    string `gorm:"column:headlines_json" json:"headlinesJson"`
	ThumbnailDataURL string `gorm:"column:thumbnail_data_url" json:"thumbnailDataUrl"`
}

func (TemplateLive) TableName() string {
	return "template"
}

type TemplateHis struct {
	TemplateLive
}

func (TemplateHis) TableName() string {
	return "template_his"
}
