import { describe, expect, it } from "vitest";

import {
  type D1Database,
  type D1PreparedStatement,
  formatShanghaiDate,
  getShanghaiDayStart,
  readArchiveTotals,
  shanghaiDateStart,
  syncTrafficArchive,
} from "./traffic-archive";

interface Baseline {
  since_date: string;
  through_date: string;
  visits: number;
  page_views: number;
  created_at: string;
}

interface Daily {
  visits: number;
  page_views: number;
  status: string;
  synced_at: string;
}

class FakeStatement implements D1PreparedStatement {
  values: unknown[] = [];

  constructor(
    readonly db: FakeD1,
    readonly query: string,
  ) {}

  bind(...values: unknown[]) {
    this.values = values;
    return this;
  }

  async first<T>(): Promise<T | null> {
    return this.db.first(this) as T | null;
  }

  async run<T>() {
    this.db.apply(this);
    return { success: true } as { success: boolean; results?: T[] };
  }
}

class FakeD1 implements D1Database {
  baseline: Baseline | null = null;
  daily = new Map<string, Daily>();

  prepare(query: string) {
    return new FakeStatement(this, query);
  }

  async batch<T>(statements: D1PreparedStatement[]) {
    for (const statement of statements) this.apply(statement as FakeStatement);
    return statements.map(() => ({ success: true })) as Array<{
      success: boolean;
      results?: T[];
    }>;
  }

  first(statement: FakeStatement) {
    if (statement.query.includes("b.visits + COALESCE")) {
      if (!this.baseline) return null;
      const today = statement.values[0] as string;
      const rows = [...this.daily.entries()].filter(
        ([date]) =>
          date >= this.baseline!.through_date && date < today,
      );
      return {
        ...this.baseline,
        visits:
          this.baseline.visits +
          rows.reduce((sum, [, row]) => sum + row.visits, 0),
        page_views:
          this.baseline.page_views +
          rows.reduce((sum, [, row]) => sum + row.page_views, 0),
        archived_through: rows.at(-1)?.[0] ?? null,
        updated_at:
          rows.at(-1)?.[1].synced_at ?? this.baseline.created_at,
      };
    }

    if (statement.query.includes("FROM traffic_baseline")) {
      return this.baseline;
    }

    if (statement.query.includes("MAX(date) AS max_date")) {
      return { max_date: [...this.daily.keys()].at(-1) ?? null };
    }

    return null;
  }

  apply(statement: FakeStatement) {
    if (statement.query.includes("INSERT INTO traffic_baseline")) {
      this.baseline = {
        since_date: statement.values[0] as string,
        through_date: statement.values[1] as string,
        visits: statement.values[2] as number,
        page_views: statement.values[3] as number,
        created_at: statement.values[4] as string,
      };
      return;
    }

    if (statement.query.includes("INSERT INTO traffic_daily")) {
      this.daily.set(statement.values[0] as string, {
        visits: statement.values[1] as number,
        page_views: statement.values[2] as number,
        status: "provisional",
        synced_at: statement.values[4] as string,
      });
      return;
    }

    if (statement.query.includes("UPDATE traffic_daily")) {
      const before = statement.values[0] as string;
      for (const [date, row] of this.daily) {
        if (date < before) row.status = "final";
      }
    }
  }
}

describe("traffic D1 archive", () => {
  it("uses stable Asia/Shanghai date boundaries", () => {
    const now = new Date("2026-08-07T15:59:59.000Z");
    expect(formatShanghaiDate(getShanghaiDayStart(now))).toBe("2026-08-07");
    expect(shanghaiDateStart("2026-08-07").toISOString()).toBe(
      "2026-08-06T16:00:00.000Z",
    );
  });

  it("creates a baseline and upserts the seven most recent complete days", async () => {
    const db = new FakeD1();
    const windows: Array<[string, string]> = [];
    const result = await syncTrafficArchive(
      {
        TRAFFIC_DB: db,
        TRAFFIC_HISTORY_START: "2026-07-10",
      },
      new Date("2026-08-07T13:30:00.000Z"),
      async (_env, from, to) => {
        windows.push([from.toISOString(), to.toISOString()]);
        const days = Math.round((to.getTime() - from.getTime()) / 86_400_000);
        return {
          visits: days === 21 ? 210 : 1,
          pageViews: days === 21 ? 2100 : 10,
          sampleInterval: 1,
        };
      },
    );

    expect(result).toEqual({
      baselineCreated: true,
      syncedDates: [
        "2026-07-31",
        "2026-08-01",
        "2026-08-02",
        "2026-08-03",
        "2026-08-04",
        "2026-08-05",
        "2026-08-06",
      ],
      finalizedBefore: "2026-07-31",
    });
    expect(windows).toHaveLength(8);
    expect(db.baseline).toMatchObject({
      since_date: "2026-07-10",
      through_date: "2026-07-31",
      visits: 210,
      page_views: 2100,
    });
    expect(db.daily).toHaveLength(7);

    await expect(readArchiveTotals(db, "2026-08-07")).resolves.toMatchObject({
      visits: 217,
      pageViews: 2170,
      sinceDate: "2026-07-10",
      archivedThrough: "2026-08-06",
    });
  });

  it("fills an archive gap after an outage longer than seven days", async () => {
    const db = new FakeD1();
    db.baseline = {
      since_date: "2026-07-10",
      through_date: "2026-08-01",
      visits: 100,
      page_views: 1000,
      created_at: "2026-08-01T00:00:00.000Z",
    };
    db.daily.set("2026-08-01", {
      visits: 1,
      page_views: 10,
      status: "provisional",
      synced_at: "2026-08-02T00:00:00.000Z",
    });

    const result = await syncTrafficArchive(
      { TRAFFIC_DB: db },
      new Date("2026-08-10T08:00:00.000Z"),
      async () => ({ visits: 2, pageViews: 20, sampleInterval: 1 }),
    );

    expect(result.syncedDates.at(0)).toBe("2026-08-02");
    expect(result.syncedDates.at(-1)).toBe("2026-08-09");
    expect(result.finalizedBefore).toBe("2026-08-03");
    expect(db.daily.get("2026-08-02")?.status).toBe("final");
  });
});
