package entity

import crudModel "gitlab.universedigital.my.id/library/golang/crud/model"

type PosterLive struct {
	crudModel.AuditTrail
	DeceasedName      string `gorm:"column:deceased_name" json:"deceasedName"`
	Title             string `gorm:"column:title" json:"title"`
	Keterangan        string `gorm:"column:keterangan" json:"keterangan"`
	Age               string `gorm:"column:age" json:"age"`
	DateOfPassing     string `gorm:"column:date_of_passing" json:"dateOfPassing"`
	TimeOfPassing     string `gorm:"column:time_of_passing" json:"timeOfPassing"`
	TimeOfPassingZone string `gorm:"column:time_of_passing_zone" json:"timeOfPassingZone"`
	ImageURL          string `gorm:"column:image_url" json:"imageUrl"`
	PlaceOfPassing    string `gorm:"column:place_of_passing" json:"placeOfPassing"`
	PlaceLaidOut      string `gorm:"column:place_laid_out" json:"placeLaidOut"`
	ProcessionType    string `gorm:"column:procession_type" json:"processionType"`
	ProcessionDate    string `gorm:"column:procession_date" json:"processionDate"`
	ProcessionTime    string `gorm:"column:procession_time" json:"processionTime"`
	ProcessionTZ      string `gorm:"column:procession_time_zone" json:"processionTimeZone"`
	ProcessionPlace   string `gorm:"column:procession_place" json:"processionPlace"`
	MessageFrom       string `gorm:"column:message_from" json:"messageFrom"`
	Theme             string `gorm:"column:theme" json:"theme"`
	FamilyData        string `gorm:"column:family_data" json:"familyData"`
	CondolenceMessage string `gorm:"column:condolence_message" json:"condolenceMessage"`
	RelationSummary   string `gorm:"column:relation_summary" json:"relationSummary"`
	DeathStatement    string `gorm:"column:death_statement" json:"deathStatement"`
}

func (PosterLive) TableName() string {
	return "poster"
}

type PosterHis struct {
	PosterLive
}

func (PosterHis) TableName() string {
	return "poster_his"
}
