import type { APIRoute } from "astro";

const DEMO_TOKEN = "my-secret-token"; // put this in env vars in real apps

export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get("authorization");

  // Check if header is present and correct
  if (!authHeader || authHeader !== `Bearer ${DEMO_TOKEN}`) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401 }
    );
  }

  // If authorized, return some demo data
  return new Response(
    JSON.stringify({
      status: "success",
      data: {
        id: 123,
        name: "Demo API",
        message: "You are authenticated 🎉"
      }
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
};
