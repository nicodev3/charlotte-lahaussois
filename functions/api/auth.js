import { missingOauthEnvResponse } from "../_lib/github-oauth.js";

/**
 * Démarre le flux OAuth GitHub pour Decap CMS.
 * @param {{ request: Request, env: Record<string, string> }} context
 */
export async function onRequestGet({ request, env }) {
  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) return missingOauthEnvResponse();

  const url = new URL(request.url);
  const state = crypto.randomUUID();
  const redirectUrl = new URL("https://github.com/login/oauth/authorize");
  redirectUrl.searchParams.set("client_id", clientId);
  redirectUrl.searchParams.set("redirect_uri", `${url.origin}/api/callback`);
  redirectUrl.searchParams.set("scope", "repo user");
  redirectUrl.searchParams.set("state", state);

  const secure = url.protocol === "https:" ? "; Secure" : "";
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl.href,
      "Set-Cookie": `oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax${secure}`,
    },
  });
}
