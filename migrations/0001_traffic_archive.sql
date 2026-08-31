CREATE TABLE traffic_baseline (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  since_date TEXT NOT NULL CHECK (length(since_date) = 10),
  through_date TEXT NOT NULL CHECK (length(through_date) = 10),
  visits INTEGER NOT NULL CHECK (visits >= 0),
  page_views INTEGER NOT NULL CHECK (page_views >= 0),
  source TEXT NOT NULL DEFAULT 'cloudflare-rum',
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE traffic_daily (
  date TEXT PRIMARY KEY CHECK (length(date) = 10),
  visits INTEGER NOT NULL CHECK (visits >= 0),
  page_views INTEGER NOT NULL CHECK (page_views >= 0),
  status TEXT NOT NULL CHECK (status IN ('provisional', 'final')),
  sample_interval REAL,
  synced_at TEXT NOT NULL
) STRICT;

CREATE INDEX idx_traffic_daily_status_date
  ON traffic_daily(status, date);

CREATE TABLE traffic_sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  synced_dates INTEGER NOT NULL DEFAULT 0,
  error TEXT
) STRICT;
