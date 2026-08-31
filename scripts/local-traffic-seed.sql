-- Local preview only. These values contain no Cloudflare credentials.
-- The baseline contains complete days before 2026-08-07; today's mock data is
-- added by the Pages Function so the preview total is 252,560 / 1,165,000.
INSERT INTO traffic_baseline (
  id,
  since_date,
  through_date,
  visits,
  page_views,
  source,
  created_at
) VALUES (
  1,
  '2026-07-10',
  '2026-08-07',
  249630,
  1154840,
  'local-preview',
  '2026-08-07T00:00:00.000Z'
)
ON CONFLICT(id) DO UPDATE SET
  since_date = excluded.since_date,
  through_date = excluded.through_date,
  visits = excluded.visits,
  page_views = excluded.page_views,
  source = excluded.source,
  created_at = excluded.created_at;
