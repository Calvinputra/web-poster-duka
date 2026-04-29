package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func OpenDatabase(dbPath string) (*gorm.DB, error) {
	databaseURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if databaseURL != "" {
		db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
		if err != nil {
			return nil, fmt.Errorf("open postgres: %w", err)
		}
		return db, nil
	}

	if dbPath == "" {
		dbPath = "data/web_poster_duka.db"
	}

	absolutePath, err := filepath.Abs(dbPath)
	if err != nil {
		return nil, fmt.Errorf("resolve db path: %w", err)
	}

	if err := os.MkdirAll(filepath.Dir(absolutePath), 0o755); err != nil {
		return nil, fmt.Errorf("create db directory: %w", err)
	}

	db, err := gorm.Open(sqlite.Open(absolutePath), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("open sqlite: %w", err)
	}

	return db, nil
}
