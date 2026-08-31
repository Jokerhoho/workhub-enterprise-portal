import { describe, expect, it } from "vitest";

import {
  buildTrafficResponse,
  getShanghaiDayStart,
  normalizeLiveTraffic,
} from "./traffic";

describe("traffic Pages Function", () => {
  it("calculates the start of today in Asia/Shanghai", () => {
    const now = new Date("2026-08-07T13:30:00.000Z");
    expect(getShanghaiDayStart(now).toISOString()).toBe(
      "2026-08-06T16:00:00.000Z",
    );
  });

  it("normalizes Cloudflare live visits and page views", () => {
    expect(
      normalizeLiveTraffic({
        data: {
          viewer: {
            accounts: [
              {
                todayVisits: [
                  { count: 456.3, sum: { visits: 123.4 } },
                ],
                last24hVisits: [
                  { count: 41500, sum: { visits: 9970 } },
                ],
              },
            ],
          },
        },
      }),
    ).toEqual({
      todayVisits: 123,
      todayPageViews: 456,
      last24hVisits: 9970,
      last24hPageViews: 41500,
    });
  });

  it("adds today's live metrics to the permanent D1 archive", () => {
    const now = new Date("2026-08-07T13:30:00.000Z");
    const result = buildTrafficResponse(
      {
        todayVisits: 2930,
        todayPageViews: 10160,
        last24hVisits: 3120,
        last24hPageViews: 10940,
      },
      {
        visits: 249630,
        pageViews: 1154840,
        sinceDate: "2026-07-10",
        throughDate: "2026-08-07",
        archivedThrough: "2026-08-06",
        updatedAt: "2026-08-07T00:00:00.000Z",
      },
      now,
    );

    expect(result).toMatchObject({
      todayVisits: 2930,
      todayPageViews: 10160,
      totalVisits: 252560,
      totalPageViews: 1165000,
      totalSince: "2026-07-10",
      archivedThrough: "2026-08-06",
      source: "cloudflare-rum+d1",
      stale: false,
      timezone: "Asia/Shanghai",
    });
    expect(result).not.toHaveProperty("totalWindowDays");
  });
});
