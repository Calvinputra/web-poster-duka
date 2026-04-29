package controller

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"web-poster-duka/backend/api/poster/interfaces"
	"web-poster-duka/backend/api/poster/model"
)

type PosterController struct {
	service interfaces.PosterServiceInterface
}

func NewPosterController(service interfaces.PosterServiceInterface) *PosterController {
	return &PosterController{service: service}
}

func (c *PosterController) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/posters", c.handlePosters)
	mux.HandleFunc("/api/posters/", c.handlePosterByID)
}

func (c *PosterController) handlePosters(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		c.handleListPosters(w, r)
		return
	}
	if r.Method == http.MethodPost {
		c.handleCreatePoster(w, r)
		return
	}

	writeError(w, http.StatusMethodNotAllowed, "method not allowed")
}

func (c *PosterController) handleCreatePoster(w http.ResponseWriter, r *http.Request) {

	var req model.PosterCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	actor := r.Header.Get("X-Actor")
	if strings.TrimSpace(actor) == "" {
		actor = "web-user"
	}

	poster, err := c.service.Create(req, actor)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, model.APIResponse[model.PosterResponse]{
		Message: "poster generated",
		Data:    poster,
	})
}

func (c *PosterController) handleListPosters(w http.ResponseWriter, r *http.Request) {
	limit := 50
	if rawLimit := strings.TrimSpace(r.URL.Query().Get("limit")); rawLimit != "" {
		parsedLimit, err := strconv.Atoi(rawLimit)
		if err != nil || parsedLimit <= 0 {
			writeError(w, http.StatusBadRequest, "invalid limit")
			return
		}
		limit = parsedLimit
	}

	posters, err := c.service.List(limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch posters")
		return
	}

	writeJSON(w, http.StatusOK, model.APIResponse[[]model.PosterResponse]{
		Message: "poster list",
		Data:    posters,
	})
}

func (c *PosterController) handlePosterByID(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/posters/")
	if strings.TrimSpace(id) == "" {
		writeError(w, http.StatusBadRequest, "poster id is required")
		return
	}

	if r.Method == http.MethodGet {
		c.handleGetPosterByID(w, id)
		return
	}
	if r.Method == http.MethodPut {
		c.handleUpdatePoster(w, r, id)
		return
	}
	if r.Method == http.MethodDelete {
		c.handleDeletePoster(w, r, id)
		return
	}

	writeError(w, http.StatusMethodNotAllowed, "method not allowed")
}

func (c *PosterController) handleGetPosterByID(w http.ResponseWriter, id string) {
	poster, err := c.service.GetByID(id)
	if err != nil {
		writeError(w, http.StatusNotFound, "poster not found")
		return
	}

	writeJSON(w, http.StatusOK, model.APIResponse[model.PosterResponse]{
		Message: "poster found",
		Data:    poster,
	})
}

func (c *PosterController) handleUpdatePoster(w http.ResponseWriter, r *http.Request, id string) {
	var req model.PosterCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	actor := strings.TrimSpace(r.Header.Get("X-Actor"))
	if actor == "" {
		actor = "web-user"
	}

	poster, err := c.service.Update(id, req, actor)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, model.APIResponse[model.PosterResponse]{
		Message: "poster updated",
		Data:    poster,
	})
}

func (c *PosterController) handleDeletePoster(w http.ResponseWriter, r *http.Request, id string) {
	actor := strings.TrimSpace(r.Header.Get("X-Actor"))
	if actor == "" {
		actor = "web-user"
	}

	if err := c.service.Delete(id, actor); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "poster deleted"})
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
