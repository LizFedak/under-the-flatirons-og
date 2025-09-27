import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ cookies }) => {
  const access = cookies.get("sb-access-token")?.value;
  const refresh = cookies.get("sb-refresh-token")?.value;
  if (!access || !refresh) {
    return new Response(JSON.stringify({ user: null }), { status: 401 });
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: access,
    refresh_token: refresh,
  });
  if (error || !data?.session?.user) {
    return new Response(JSON.stringify({ user: null }), { status: 401 });
  }

  // persist rotated tokens (if any)
  const { access_token: newAccess, refresh_token: newRefresh } = data.session;
  if (newAccess && newRefresh && (newAccess !== access || newRefresh !== refresh)) {
    cookies.set("sb-access-token", newAccess, { path: "/" });
    cookies.set("sb-refresh-token", newRefresh, { path: "/" });
  }

  const { id, email, user_metadata } = data.session.user;
  return new Response(JSON.stringify({ user: { id, email, user_metadata } }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
