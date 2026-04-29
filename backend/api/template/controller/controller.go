package controller

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"web-poster-duka/backend/api/template/interfaces"
	"web-poster-duka/backend/api/template/model"
)

type TemplateController struct {
	service interfaces.TemplateServiceInterface
}

func NewTemplateController(service interfaces.TemplateServiceInterface) *TemplateController {
	return &TemplateController{service: service}
}

func (c *TemplateController) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/templates", c.handleTemplates)
	mux.HandleFunc("/api/templates/", c.handleTemplateByID)
}

func (c *TemplateController) handleTemplates(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		c.handleListTemplates(w, r)
		return
	}
	if r.Method == http.MethodPost {
		c.handleCreateTemplate(w, r)
		return
	}

	writeError(w, http.StatusMethodNotAllowed, "method not allowed")
}

func (c *TemplateController) handleCreateTemplate(w http.ResponseWriter, r *http.Request) {
	var req model.TemplateCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	actor := strings.TrimSpace(r.Header.Get("X-Actor"))
	if actor == "" {
		actor = "web-user"
	}

	template, err := c.service.Create(req, actor)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, model.APIResponse[model.TemplateResponse]{
		Message: "template created",
		Data:    template,
	})
}

func (c *TemplateController) handleListTemplates(w http.ResponseWriter, r *http.Request) {
	limit := 50
	if rawLimit := strings.TrimSpace(r.URL.Query().Get("limit")); rawLimit != "" {
		parsedLimit, err := strconv.Atoi(rawLimit)
		if err != nil || parsedLimit <= 0 {
			writeError(w, http.StatusBadRequest, "invalid limit")
			return
		}
		limit = parsedLimit
	}

	templates, err := c.service.List(limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch templates")
		return
	}

	writeJSON(w, http.StatusOK, model.APIResponse[[]model.TemplateResponse]{
		Message: "template list",
		Data:    templates,
	})
}

func (c *TemplateController) handleTemplateByID(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/templates/")
	if strings.TrimSpace(id) == "" {
		writeError(w, http.StatusBadRequest, "template id is required")
		return
	}

	if r.Method == http.MethodGet {
		c.handleGetTemplateByID(w, id)
		return
	}
	if r.Method == http.MethodPut {
		c.handleUpdateTemplate(w, r, id)
		return
	}
	if r.Method == http.MethodDelete {
		c.handleDeleteTemplate(w, r, id)
		return
	}

	writeError(w, http.StatusMethodNotAllowed, "method not allowed")
}

func (c *TemplateController) handleGetTemplateByID(w http.ResponseWriter, id string) {
	template, err := c.service.GetByID(id)
	if err != nil {
		writeError(w, http.StatusNotFound, "template not found")
		return
	}

	writeJSON(w, http.StatusOK, model.APIResponse[model.TemplateResponse]{
		Message: "template found",
		Data:    template,
	})
}

func (c *TemplateController) handleUpdateTemplate(w http.ResponseWriter, r *http.Request, id string) {
	var req model.TemplateCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	actor := strings.TrimSpace(r.Header.Get("X-Actor"))
	if actor == "" {
		actor = "web-user"
	}

	template, err := c.service.Update(id, req, actor)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, model.APIResponse[model.TemplateResponse]{
		Message: "template updated",
		Data:    template,
	})
}

func (c *TemplateController) handleDeleteTemplate(w http.ResponseWriter, r *http.Request, id string) {
	actor := strings.TrimSpace(r.Header.Get("X-Actor"))
	if actor == "" {
		actor = "web-user"
	}

	if err := c.service.Delete(id, actor); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "template deleted"})
}

func writeJSON(w http.ResponseWriter, statusCode int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, statusCode int, message string) {
	type errorResponse struct {
		Message string `json:"message"`
	}

	writeJSON(w, statusCode, errorResponse{Message: message})
}
