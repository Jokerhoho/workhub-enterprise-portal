import {
  syncTrafficArchive,
  type TrafficArchiveEnv,
} from "../../lib/traffic-archive";

interface Env extends TrafficArchiveEnv {
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (
    !context.env.TRAFFIC_SYNC_TOKEN ||
    context.request.headers.get("Authorization") !==
      `Bearer ${context.env.TRAFFIC_SYNC_TOKEN}`
  ) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const result = await syncTrafficArchive(context.env);
    return json({ ok: true, ...result });
  } catch (error) {
    console.error("Traffic archive sync failed", error);
    return json({ error: "Traffic archive sync failed" }, 502);
  }
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  return onRequestPost(context);
};
