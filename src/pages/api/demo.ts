import type { APIRoute } from "astro";

// ✅ Ensure this endpoint runs on the server (no prerender)
export const prerender = false;

// In real apps, set these via env vars:
const BEARER_TOKEN = import.meta.env.DEMO_BEARER ?? "my-secret-token";
const API_KEY      = import.meta.env.DEMO_API_KEY ?? "demo-api-key";
const BASIC_USER   = import.meta.env.DEMO_BASIC_USER ?? "demo";
const BASIC_PASS   = import.meta.env.DEMO_BASIC_PASS ?? "password";

function unauthorized(message = "Unauthorized") {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: {
      "Content-Type": "application/json",
      // Helps browsers/tools know what auth to send (especially for Basic)
      "WWW-Authenticate": 'Bearer, Basic realm="demo", charset="UTF-8"',
    },
  });
}

export const GET: APIRoute = async ({ request }) => {
  // Always read headers from the handler arg, not Astro.request
  const auth = request.headers.get("authorization");
  const apiKey = request.headers.get("x-api-key");

  // Accept ANY of the 3 auth methods for demo convenience
  const okByBearer = auth?.toLowerCase().startsWith("bearer ") &&
                     auth.slice(7) === BEARER_TOKEN;

  const okByApiKey = apiKey === API_KEY;

  let okByBasic = false;
  if (auth?.toLowerCase().startsWith("basic ")) {
    try {
      const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
      const [user, pass] = decoded.split(":");
      okByBasic = user === BASIC_USER && pass === BASIC_PASS;
    } catch {
      // ignore, will 401 below
    }
  }

  if (!(okByBearer || okByApiKey || okByBasic)) {
    return unauthorized();
  }

  return new Response(
    JSON.stringify({
      status: "success",
      data: {
        id: 123,
        name: "Astro Demo API",
        message: "You are authenticated 🎉",
        when: new Date().toISOString(),
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
