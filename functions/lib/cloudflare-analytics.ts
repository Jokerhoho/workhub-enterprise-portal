export interface AnalyticsEnv {
  CF_ANALYTICS_TOKEN?: string;
  CF_ACCOUNT_ID?: string;
  CF_WEB_ANALYTICS_SITE_TAG?: string;
  CF_ANALYTICS_MOCK?: string;
}

interface GraphQlGroup {
  count?: number;
  sum?: { visits?: number };
  avg?: { sampleInterval?: number };
}

interface GraphQlResponse {
  data?: {
    viewer?: {
      accounts?: Array<Record<string, GraphQlGroup[] | undefined>>;
    };
  };
  errors?: Array<{ message?: string }> | null;
}

export interface TrafficWindow {
  visits: number;
  pageViews: number;
  sampleInterval: number | null;
}

export interface LiveTraffic {
  todayVisits: number;
  todayPageViews: number;
  last24hVisits: number;
  last24hPageViews: number;
}

const CLOUDFLARE_GRAPHQL_ENDPOINT =
  "https://api.cloudflare.com/client/v4/graphql";

const LIVE_QUERY = `
  query PublicTraffic(
    $accountTag: string!
    $todayFilter: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject!
    $last24hFilter: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject!
  ) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        todayVisits: rumPageloadEventsAdaptiveGroups(
          limit: 1
          filter: $todayFilter
        ) {
          count
          sum { visits }
          avg { sampleInterval }
        }
        last24hVisits: rumPageloadEventsAdaptiveGroups(
          limit: 1
          filter: $last24hFilter
        ) {
          count
          sum { visits }
          avg { sampleInterval }
        }
      }
    }
  }
`;

const WINDOW_QUERY = `
  query TrafficWindow(
    $accountTag: string!
    $windowFilter: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject!
  ) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        window: rumPageloadEventsAdaptiveGroups(
          limit: 1
          filter: $windowFilter
        ) {
          count
          sum { visits }
          avg { sampleInterval }
        }
      }
    }
  }
`;

function analyticsFilter(siteTag: string, from: Date, to: Date) {
  return {
    siteTag,
    datetime_geq: from.toISOString(),
    datetime_lt: to.toISOString(),
  };
}

function visits(groups: GraphQlGroup[] = []): number {
  return Math.round(
    groups.reduce((total, group) => total + (group.sum?.visits ?? 0), 0),
  );
}

function pageViews(groups: GraphQlGroup[] = []): number {
  return Math.round(
    groups.reduce((total, group) => total + (group.count ?? 0), 0),
  );
}

function sampleInterval(groups: GraphQlGroup[] = []): number | null {
  if (!groups.length) return null;
  const total = groups.reduce(
    (sum, group) => sum + (group.avg?.sampleInterval ?? 0),
    0,
  );
  return total > 0 ? total / groups.length : null;
}

function getAccount(payload: GraphQlResponse) {
  if (payload.errors?.length) {
    throw new Error(
      payload.errors[0]?.message || "Cloudflare Analytics query failed",
    );
  }

  const account = payload.data?.viewer?.accounts?.[0];
  if (!account) {
    throw new Error("Cloudflare Web Analytics returned no account data");
  }

  return account;
}

async function queryCloudflare(
  env: AnalyticsEnv,
  query: string,
  variables: Record<string, unknown>,
): Promise<GraphQlResponse> {
  if (
    !env.CF_ANALYTICS_TOKEN ||
    !env.CF_ACCOUNT_ID ||
    !env.CF_WEB_ANALYTICS_SITE_TAG
  ) {
    throw new Error("Cloudflare Web Analytics credentials are not configured");
  }

  const response = await fetch(CLOUDFLARE_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Cloudflare Analytics returned HTTP ${response.status}`);
  }

  return (await response.json()) as GraphQlResponse;
}

export function normalizeLiveTraffic(payload: GraphQlResponse): LiveTraffic {
  const account = getAccount(payload);

  return {
    todayVisits: visits(account.todayVisits),
    todayPageViews: pageViews(account.todayVisits),
    last24hVisits: visits(account.last24hVisits),
    last24hPageViews: pageViews(account.last24hVisits),
  };
}

export async function queryLiveTraffic(
  env: AnalyticsEnv,
  todayStart: Date,
  now: Date,
): Promise<LiveTraffic> {
  if (env.CF_ANALYTICS_MOCK) {
    return normalizeLiveTraffic(
      JSON.parse(env.CF_ANALYTICS_MOCK) as GraphQlResponse,
    );
  }

  const payload = await queryCloudflare(env, LIVE_QUERY, {
    accountTag: env.CF_ACCOUNT_ID,
    todayFilter: analyticsFilter(
      env.CF_WEB_ANALYTICS_SITE_TAG as string,
      todayStart,
      now,
    ),
    last24hFilter: analyticsFilter(
      env.CF_WEB_ANALYTICS_SITE_TAG as string,
      new Date(now.getTime() - 24 * 60 * 60 * 1000),
      now,
    ),
  });

  return normalizeLiveTraffic(payload);
}

export async function queryTrafficWindow(
  env: AnalyticsEnv,
  from: Date,
  to: Date,
): Promise<TrafficWindow> {
  const payload = await queryCloudflare(env, WINDOW_QUERY, {
    accountTag: env.CF_ACCOUNT_ID,
    windowFilter: analyticsFilter(
      env.CF_WEB_ANALYTICS_SITE_TAG as string,
      from,
      to,
    ),
  });
  const groups = getAccount(payload).window;

  return {
    visits: visits(groups),
    pageViews: pageViews(groups),
    sampleInterval: sampleInterval(groups),
  };
}
