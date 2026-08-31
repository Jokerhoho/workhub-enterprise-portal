interface Env {
  TRAFFIC_SYNC_URL: string;
  TRAFFIC_SYNC_TOKEN?: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function triggerSync(env: Env) {
  if (!env.TRAFFIC_SYNC_TOKEN) {
    throw new Error("TRAFFIC_SYNC_TOKEN is not configured");
  }

  const response = await fetch(env.TRAFFIC_SYNC_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.TRAFFIC_SYNC_TOKEN}`,
      Accept: "application/json",
    },
  });
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Pages sync returned HTTP ${response.status}: ${body}`);
  }

  return body ? JSON.parse(body) : { ok: true };
}

export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    context: ExecutionContext,
  ) {
    context.waitUntil(triggerSync(env));
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true, service: "workbuddy-traffic-collector" });
    }

    if (url.pathname !== "/sync" || request.method !== "POST") {
      return json({ error: "Not found" }, 404);
    }

    if (
      !env.TRAFFIC_SYNC_TOKEN ||
      request.headers.get("Authorization") !==
        `Bearer ${env.TRAFFIC_SYNC_TOKEN}`
    ) {
      return json({ error: "Unauthorized" }, 401);
    }

    try {
      return json(await triggerSync(env));
    } catch (error) {
      console.error("Traffic archive sync failed", error);
      return json({ error: "Traffic archive sync failed" }, 502);
    }
  },
};
