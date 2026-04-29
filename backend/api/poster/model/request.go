package model

type PosterCreateRequest struct {
	DeceasedName      string `json:"deceasedName"`
	Title             string `json:"title"`
	Keterangan        string `json:"keterangan"`
	Age               string `json:"age"`
	DateOfPassing     string `json:"dateOfPassing"`
	TimeOfPassing     string `json:"timeOfPassing"`
	TimeOfPassingZone string `json:"timeOfPassingZone"`
	ImageURL          string `json:"imageUrl"`
	PlaceOfPassing    string `json:"placeOfPassing"`
	PlaceLaidOut      string `json:"placeLaidOut"`
	ProcessionType    string `json:"processionType"`
	ProcessionDate    string `json:"processionDate"`
	ProcessionTime    string `json:"processionTime"`
	ProcessionTZ      string `json:"processionTimeZone"`
	ProcessionPlace   string `json:"processionPlace"`
	MessageFrom       string `json:"messageFrom"`
	Theme             string `json:"theme"`
	FamilyData        string `json:"familyData"`
	CondolenceMessage string `json:"condolenceMessage"`
	RelationSummary   string `json:"relationSummary"`
	DeathStatement    string `json:"deathStatement"`
}
