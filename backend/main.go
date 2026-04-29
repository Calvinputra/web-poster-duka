package main

import (
	"log"
	"net/http"
	"os"
	"web-poster-duka/backend/api/poster/controller"
	"web-poster-duka/backend/api/poster/repository"
	"web-poster-duka/backend/api/poster/service"
	templateController "web-poster-duka/backend/api/template/controller"
	templateRepository "web-poster-duka/backend/api/template/repository"
	templateService "web-poster-duka/backend/api/template/service"
	"web-poster-duka/backend/config"

	"github.com/joho/godotenv"
)

func main() {
	loadEnv()
	mux := http.NewServeMux()

	dbPath := os.Getenv("DB_PATH")
	db, err := config.OpenDatabase(dbPath)
	if err != nil {
		log.Fatalf("cannot initialize db: %v", err)
	}

	posterRepository := repository.NewPosterRepository(db)
	if err := posterRepository.Migrate(); err != nil {
		log.Fatalf("cannot run migration: %v", err)
	}

	posterService := service.NewPosterService(posterRepository)
	posterController := controller.NewPosterController(posterService)

	templateRepo := templateRepository.NewTemplateRepository(db)
	if err := templateRepo.Migrate(); err != nil {
		log.Fatalf("cannot run template migration: %v", err)
	}

	templateSvc := templateService.NewTemplateService(templateRepo)
	templateCtrl := templateController.NewTemplateController(templateSvc)

	posterController.RegisterRoutes(mux)
	templateCtrl.RegisterRoutes(mux)
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})

	addr := ":8080"
	log.Printf("Go API running on http://localhost%s\n", addr)

	if err := http.ListenAndServe(addr, withCORS(mux)); err != nil {
		log.Fatal(err)
	}
}

func loadEnv() {
	// Prefer project-root .env, fallback to backend/.env when present.
	candidates := []string{"../.env", ".env"}
	loadedAny := false
	for _, path := range candidates {
		if _, err := os.Stat(path); err != nil {
			continue
		}
		if err := godotenv.Overload(path); err != nil {
			log.Printf("warning: cannot load %s: %v", path, err)
			continue
		}
		loadedAny = true
	}
	if !loadedAny {
		log.Printf("warning: no .env file found, using existing environment variables")
	}
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type,X-Actor")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
