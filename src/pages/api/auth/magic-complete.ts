import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  const { access_token, refresh_token } = await request.json().catch(() => ({}));
  if (!access_token || !refresh_token) {
    return new Response("Missing tokens", { status: 400 });
  }

  const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error || !data?.session) {
    return new Response(error?.message ?? "Invalid session", { status: 401 });
  }

  cookies.set("sb-access-token", data.session.access_token, { path: "/" });
  cookies.set("sb-refresh-token", data.session.refresh_token, { path: "/" });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
