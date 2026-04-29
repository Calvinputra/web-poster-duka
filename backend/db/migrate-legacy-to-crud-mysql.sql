-- Migration: legacy poster schema -> CRUD library schema (MySQL 8+)
-- Jalankan di DBeaver setelah backup database.

START TRANSACTION;

-- 1) Tambah kolom audit trail ke tabel poster (legacy -> new)
ALTER TABLE poster
  ADD COLUMN IF NOT EXISTS recid VARCHAR(128) NULL,
  ADD COLUMN IF NOT EXISTS name VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS curr_no BIGINT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS record_status VARCHAR(16) NOT NULL DEFAULT 'LIVE',
  ADD COLUMN IF NOT EXISTS inputter VARCHAR(255) NOT NULL DEFAULT 'migration',
  ADD COLUMN IF NOT EXISTS input_datetime BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS authoriser TEXT NULL,
  ADD COLUMN IF NOT EXISTS auth_datetime TEXT NULL,
  ADD COLUMN IF NOT EXISTS notes TEXT NULL,
  ADD COLUMN IF NOT EXISTS created_by VARCHAR(255) NOT NULL DEFAULT 'migration',
  ADD COLUMN IF NOT EXISTS created_datetime BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS branch_code VARCHAR(255) NOT NULL DEFAULT '';

-- 2) Mapping data lama ke kolom baru
UPDATE poster
SET
  recid = COALESCE(NULLIF(recid, ''), id),
  name = COALESCE(NULLIF(name, ''), deceased_name),
  input_datetime = CASE
    WHEN input_datetime = 0 THEN UNIX_TIMESTAMP(COALESCE(created_at, NOW())) * 1000
    ELSE input_datetime
  END,
  created_datetime = CASE
    WHEN created_datetime = 0 THEN UNIX_TIMESTAMP(COALESCE(created_at, NOW())) * 1000
    ELSE created_datetime
  END,
  authoriser = COALESCE(authoriser, '["migration"]'),
  auth_datetime = COALESCE(auth_datetime, CONCAT('[', UNIX_TIMESTAMP(COALESCE(created_at, NOW())) * 1000, ']'));

-- 3) Jadikan recid sebagai PK utama
ALTER TABLE poster DROP PRIMARY KEY;
ALTER TABLE poster MODIFY recid VARCHAR(128) NOT NULL;
ALTER TABLE poster ADD PRIMARY KEY (recid);

-- 4) Hapus kolom id + created_at lama (opsional, disarankan)
ALTER TABLE poster
  DROP COLUMN IF EXISTS id,
  DROP COLUMN IF EXISTS created_at;

-- 5) Recreate table poster_his sesuai schema CRUD (karena format lama berbeda total)
DROP TABLE IF EXISTS poster_his;

CREATE TABLE poster_his (
  recid VARCHAR(128) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  curr_no BIGINT NOT NULL DEFAULT 1,
  record_status VARCHAR(16) NOT NULL DEFAULT 'HIS',
  inputter VARCHAR(255) NOT NULL DEFAULT '',
  input_datetime BIGINT NOT NULL DEFAULT 0,
  authoriser TEXT NOT NULL,
  auth_datetime TEXT NOT NULL,
  notes TEXT NULL,
  created_by VARCHAR(255) NOT NULL DEFAULT '',
  created_datetime BIGINT NOT NULL DEFAULT 0,
  branch_code VARCHAR(255) NOT NULL DEFAULT '',
  deceased_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT '',
  keterangan VARCHAR(255) NOT NULL DEFAULT '',
  age VARCHAR(32) NOT NULL DEFAULT '',
  date_of_passing VARCHAR(255) NOT NULL,
  image_url LONGTEXT NOT NULL,
  place_of_passing VARCHAR(255) NOT NULL DEFAULT '',
  message_from VARCHAR(255) NOT NULL DEFAULT '',
  condolence_message TEXT NOT NULL
);

CREATE INDEX idx_poster_status ON poster (record_status);
CREATE INDEX idx_poster_created_datetime ON poster (created_datetime);

COMMIT;
