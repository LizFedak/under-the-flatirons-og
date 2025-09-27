import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

/** ✅ Ensure server runtime (not prerendered or edge) */
export const prerender = false;
export const runtime = "node";

/** ---- Env helpers ----
 * Use runtime envs (Vercel/Netlify/Node) first; fall back to build-time.
 */
const env = (k: string) =>
  process.env[k] ?? (import.meta as any).env?.[k] ?? undefined;

const SUPABASE_URL = env("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY =
  env("SUPABASE_SERVICE_ROLE_KEY") ?? env("SUPABASE_ANON_KEY");

/** Auth secrets (pick ONE style in practice) */
const BEARER_TOKEN = env("API_BEARER_TOKEN");
const API_KEY = env("API_KEY");
const BASIC_USER = env("BASIC_USER");
const BASIC_PASS = env("BASIC_PASS");

/** Restrict which tables can be written.
 *  Configure either:
 *    ALLOWED_TABLES="eagleview_results,another_table"
 *  or
 *    ALLOWED_TABLES_JSON='["eagleview_results","another_table"]'
 */
const allowedTables = (() => {
  try {
    if (env("ALLOWED_TABLES_JSON"))
      return JSON.parse(env("ALLOWED_TABLES_JSON")!);
  } catch {}
  return (env("ALLOWED_TABLES") || "eagleview_results")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
})();

/** CORS (works for Airtable Automations) */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-api-key",
  "Access-Control-Max-Age": "3600",
};

function unauthorized(message = "Unauthorized") {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: {
      "Content-Type": "application/json",
      "WWW-Authenticate": 'Bearer, Basic realm="astro-api", charset="UTF-8"',
      ...CORS,
    },
  });
}

function methodNotAllowed() {
  return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

/** Simple multi-style auth like your demo */
async function isAuthorized(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const apiKey = req.headers.get("x-api-key") || "";

  // Bearer
  if (BEARER_TOKEN && auth.toLowerCase().startsWith("bearer ")) {
    if (auth.slice(7) === BEARER_TOKEN) return true;
  }
  // x-api-key
  if (API_KEY && apiKey && apiKey === API_KEY) return true;
  // Basic
  if (
    BASIC_USER &&
    BASIC_PASS &&
    auth.toLowerCase().startsWith("basic ")
  ) {
    try {
      const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
      const [user, pass] = decoded.split(":");
      if (user === BASIC_USER && pass === BASIC_PASS) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

/** Reuse client across invocations */
const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      })
    : null;

type Action = "upsert" | "insert" | "update" | "delete" | "clear";

type Body = {
  /** Table to write to (must be in allow-list) */
  table: string;
  /** Row data for insert/upsert/update */
  row?: Record<string, any>;
  /** Match criteria for update/delete (e.g., {"request_id":"req-001"}) */
  where?: Record<string, any>;
  /** One of: upsert | insert | update | delete | clear */
  action?: Action;
  /** Unique column for upsert conflict handling (e.g., "request_id") */
  onConflict?: string;
  /** Optional soft-delete field names for "clear" */
  softDelete?: { inactiveField?: string; clearedAtField?: string };
};

export const OPTIONS: APIRoute = async () =>
  new Response(null, { status: 204, headers: CORS });

/** Quick health check */
export const GET: APIRoute = async ({ request }) => {
  if (!(await isAuthorized(request))) return unauthorized();
  return new Response(
    JSON.stringify({
      ok: true,
      when: new Date().toISOString(),
      allowedTables,
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS } }
  );
};

export const POST: APIRoute = async ({ request }) => {
  if (!(await isAuthorized(request))) return unauthorized();
  if (!supabase) {
    return new Response(
      JSON.stringify({ error: "Supabase env vars missing" }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS } }
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return new Response(JSON.stringify({ error: "Bad JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }

  const action: Action = body.action ?? "upsert";
  const table = body.table;

  if (!table || !allowedTables.includes(table)) {
    return new Response(
      JSON.stringify({
        error: "Table not allowed",
        allowedTables,
      }),
      { status: 400, headers: { "Content-Type": "application/json", ...CORS } }
    );
  }

  try {
    if (action === "clear") {
      const inactiveField = body.softDelete?.inactiveField ?? "is_active";
      const clearedAtField =
        body.softDelete?.clearedAtField ?? "cleared_at";
      const where = body.where ?? body.row ?? {};
      if (!Object.keys(where).length) {
        return new Response(
          JSON.stringify({ error: "`where` or `row` required for clear" }),
          { status: 400, headers: { "Content-Type": "application/json", ...CORS } }
        );
      }
      const { error } = await supabase
        .from(table)
        .update({ [inactiveField]: false, [clearedAtField]: new Date().toISOString() })
        .match(where);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, action }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    if (action === "delete") {
      const where = body.where ?? body.row ?? {};
      if (!Object.keys(where).length) {
        return new Response(
          JSON.stringify({ error: "`where` or `row` required for delete" }),
          { status: 400, headers: { "Content-Type": "application/json", ...CORS } }
        );
      }
      const { error } = await supabase.from(table).delete().match(where);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, action }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    if (action === "update") {
      const where = body.where;
      const row = body.row ?? {};
      if (!where || !Object.keys(where).length) {
        return new Response(
          JSON.stringify({ error: "`where` required for update" }),
          { status: 400, headers: { "Content-Type": "application/json", ...CORS } }
        );
      }
      const { data, error } = await supabase
        .from(table)
        .update(row)
        .match(where)
        .select();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, data }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    if (action === "insert") {
      const row = body.row ?? {};
      const { data, error } = await supabase.from(table).insert(row).select();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, data }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    // default: upsert
    const row = body.row ?? {};
    const onConflict = body.onConflict; // e.g., "request_id" (ensure unique constraint in DB)
    const { data, error } = await supabase
      .from(table)
      .upsert(row, onConflict ? { onConflict } : undefined)
      .select();
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS } }
    );
  }
};
