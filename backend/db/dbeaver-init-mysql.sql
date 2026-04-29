-- Web Poster Duka - MySQL 8+
-- Jalankan script ini di DBeaver SQL Editor.

CREATE TABLE IF NOT EXISTS poster (
  recid VARCHAR(128) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  curr_no BIGINT NOT NULL DEFAULT 1,
  record_status VARCHAR(16) NOT NULL DEFAULT 'LIVE',
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

CREATE TABLE IF NOT EXISTS poster_his (
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

-- Waktu & zona wafat (selaras GORM). Jalankan sekali jika tabel sudah ada tanpa kolom ini:
-- ALTER TABLE poster ADD COLUMN time_of_passing VARCHAR(16) NOT NULL DEFAULT '';
-- ALTER TABLE poster ADD COLUMN time_of_passing_zone VARCHAR(8) NOT NULL DEFAULT 'WIB';
-- ALTER TABLE poster ADD COLUMN keterangan VARCHAR(255) NOT NULL DEFAULT '';
-- ALTER TABLE poster_his ADD COLUMN time_of_passing VARCHAR(16) NOT NULL DEFAULT '';
-- ALTER TABLE poster_his ADD COLUMN time_of_passing_zone VARCHAR(8) NOT NULL DEFAULT 'WIB';
-- ALTER TABLE poster_his ADD COLUMN keterangan VARCHAR(255) NOT NULL DEFAULT '';
-- ALTER TABLE poster ADD COLUMN procession_time_zone VARCHAR(8) NOT NULL DEFAULT 'WIB';
-- ALTER TABLE poster_his ADD COLUMN procession_time_zone VARCHAR(8) NOT NULL DEFAULT 'WIB';
