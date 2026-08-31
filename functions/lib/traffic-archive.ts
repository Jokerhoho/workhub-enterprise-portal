import {
  type AnalyticsEnv,
  queryTrafficWindow,
  type TrafficWindow,
} from "./cloudflare-analytics";

export interface D1Result<T = unknown> {
  results?: T[];
  success?: boolean;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = Record<string, unknown>>(
    statements: D1PreparedStatement[],
  ): Promise<Array<D1Result<T>>>;
}

export interface TrafficArchiveEnv extends AnalyticsEnv {
  TRAFFIC_DB: D1Database;
  TRAFFIC_HISTORY_START?: string;
}

export interface ArchiveTotals {
  visits: number;
  pageViews: number;
  sinceDate: string;
  throughDate: string;
  archivedThrough: string;
  updatedAt: string;
}

interface BaselineRow {
  since_date: string;
  through_date: string;
  visits: number;
  page_views: number;
  created_at: string;
}

interface TotalsRow {
  since_date: string;
  through_date: string;
  visits: number;
  page_views: number;
  archived_through: string | null;
  updated_at: string;
}

interface LatestDailyRow {
  max_date: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;
const RECENT_DAYS_TO_REFRESH = 7;
const MAX_ANALYTICS_WINDOW_DAYS = 92;

export function getShanghaiDayStart(now: Date): Date {
  const chinaNow = new Date(now.getTime() + SHANGHAI_OFFSET_MS);
  return new Date(
    Date.UTC(
      chinaNow.getUTCFullYear(),
      chinaNow.getUTCMonth(),
      chinaNow.getUTCDate(),
    ) - SHANGHAI_OFFSET_MS,
  );
}

export function formatShanghaiDate(date: Date): string {
  return new Date(date.getTime() + SHANGHAI_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
}

export function shanghaiDateStart(date: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid Asia/Shanghai date: ${date}`);
  }
  return new Date(`${date}T00:00:00+08:00`);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function laterDate(first: Date, second: Date): Date {
  return first.getTime() > second.getTime() ? first : second;
}

export async function readArchiveTotals(
  db: D1Database,
  todayDate: string,
): Promise<ArchiveTotals> {
  const row = await db
    .prepare(
      `SELECT
        b.since_date,
        b.through_date,
        b.visits + COALESCE(SUM(d.visits), 0) AS visits,
        b.page_views + COALESCE(SUM(d.page_views), 0) AS page_views,
        MAX(d.date) AS archived_through,
        COALESCE(MAX(d.synced_at), b.created_at) AS updated_at
      FROM traffic_baseline b
      LEFT JOIN traffic_daily d
        ON d.date >= b.through_date AND d.date < ?1
      WHERE b.id = 1
      GROUP BY
        b.since_date,
        b.through_date,
        b.visits,
        b.page_views,
        b.created_at`,
    )
    .bind(todayDate)
    .first<TotalsRow>();

  if (!row) {
    throw new Error("Traffic history has not been initialized in D1");
  }

  return {
    visits: Number(row.visits),
    pageViews: Number(row.page_views),
    sinceDate: row.since_date,
    throughDate: row.through_date,
    archivedThrough:
      row.archived_through ??
      formatShanghaiDate(addDays(shanghaiDateStart(row.through_date), -1)),
    updatedAt: row.updated_at,
  };
}

async function sumWindows(
  env: TrafficArchiveEnv,
  from: Date,
  to: Date,
  loadWindow: typeof queryTrafficWindow,
): Promise<TrafficWindow> {
  let cursor = from;
  let totalVisits = 0;
  let totalPageViews = 0;
  let weightedSampleInterval = 0;
  let sampleWeight = 0;

  while (cursor < to) {
    const windowEnd = new Date(
      Math.min(
        to.getTime(),
        addDays(cursor, MAX_ANALYTICS_WINDOW_DAYS).getTime(),
      ),
    );
    const metrics = await loadWindow(env, cursor, windowEnd);
    totalVisits += metrics.visits;
    totalPageViews += metrics.pageViews;
    if (metrics.sampleInterval !== null) {
      weightedSampleInterval += metrics.sampleInterval * metrics.pageViews;
      sampleWeight += metrics.pageViews;
    }
    cursor = windowEnd;
  }

  return {
    visits: totalVisits,
    pageViews: totalPageViews,
    sampleInterval:
      sampleWeight > 0 ? weightedSampleInterval / sampleWeight : null,
  };
}

async function ensureBaseline(
  env: TrafficArchiveEnv,
  todayStart: Date,
  now: Date,
  loadWindow: typeof queryTrafficWindow,
): Promise<BaselineRow> {
  const existing = await env.TRAFFIC_DB.prepare(
    `SELECT since_date, through_date, visits, page_views, created_at
     FROM traffic_baseline WHERE id = 1`,
  ).first<BaselineRow>();
  if (existing) return existing;

  const sinceDate = env.TRAFFIC_HISTORY_START ?? "2026-07-10";
  const since = shanghaiDateStart(sinceDate);
  const refreshStart = addDays(todayStart, -RECENT_DAYS_TO_REFRESH);
  const through = laterDate(since, refreshStart);
  const baseline = await sumWindows(env, since, through, loadWindow);

  await env.TRAFFIC_DB.prepare(
    `INSERT INTO traffic_baseline (
       id, since_date, through_date, visits, page_views, source, created_at
     ) VALUES (1, ?1, ?2, ?3, ?4, 'cloudflare-rum', ?5)`,
  )
    .bind(
      sinceDate,
      formatShanghaiDate(through),
      baseline.visits,
      baseline.pageViews,
      now.toISOString(),
    )
    .run();

  return {
    since_date: sinceDate,
    through_date: formatShanghaiDate(through),
    visits: baseline.visits,
    page_views: baseline.pageViews,
    created_at: now.toISOString(),
  };
}

export interface ArchiveSyncResult {
  baselineCreated: boolean;
  syncedDates: string[];
  finalizedBefore: string;
}

export async function syncTrafficArchive(
  env: TrafficArchiveEnv,
  now = new Date(),
  loadWindow: typeof queryTrafficWindow = queryTrafficWindow,
): Promise<ArchiveSyncResult> {
  const todayStart = getShanghaiDayStart(now);
  const previousBaseline = await env.TRAFFIC_DB.prepare(
    "SELECT since_date FROM traffic_baseline WHERE id = 1",
  ).first<{ since_date: string }>();
  const baseline = await ensureBaseline(env, todayStart, now, loadWindow);
  const latestDaily = await env.TRAFFIC_DB.prepare(
    "SELECT MAX(date) AS max_date FROM traffic_daily",
  ).first<LatestDailyRow>();
  const recentRefreshStart = addDays(todayStart, -RECENT_DAYS_TO_REFRESH);
  const firstMissingDay = latestDaily?.max_date
    ? addDays(shanghaiDateStart(latestDaily.max_date), 1)
    : shanghaiDateStart(baseline.through_date);
  const refreshOrGapStart =
    firstMissingDay < recentRefreshStart ? firstMissingDay : recentRefreshStart;
  const refreshStart = laterDate(
    shanghaiDateStart(baseline.through_date),
    refreshOrGapStart,
  );
  const statements: D1PreparedStatement[] = [];
  const syncedDates: string[] = [];

  for (let day = refreshStart; day < todayStart; day = addDays(day, 1)) {
    const date = formatShanghaiDate(day);
    const metrics = await loadWindow(env, day, addDays(day, 1));
    syncedDates.push(date);
    statements.push(
      env.TRAFFIC_DB.prepare(
        `INSERT INTO traffic_daily (
           date, visits, page_views, status, sample_interval, synced_at
         ) VALUES (?1, ?2, ?3, 'provisional', ?4, ?5)
         ON CONFLICT(date) DO UPDATE SET
           visits = excluded.visits,
           page_views = excluded.page_views,
           status = excluded.status,
           sample_interval = excluded.sample_interval,
           synced_at = excluded.synced_at`,
      ).bind(
        date,
        metrics.visits,
        metrics.pageViews,
        metrics.sampleInterval,
        now.toISOString(),
      ),
    );
  }

  const finalizedBefore = formatShanghaiDate(recentRefreshStart);
  statements.push(
    env.TRAFFIC_DB.prepare(
      `UPDATE traffic_daily
       SET status = 'final'
       WHERE date < ?1 AND status != 'final'`,
    ).bind(finalizedBefore),
  );

  if (statements.length) {
    await env.TRAFFIC_DB.batch(statements);
  }

  return {
    baselineCreated: !previousBaseline,
    syncedDates,
    finalizedBefore,
  };
}
