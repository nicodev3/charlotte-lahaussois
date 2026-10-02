import { missingOauthEnvResponse, renderOauthResultPage } from "../_lib/github-oauth.js";

/**
 * Échange le code GitHub contre un jeton et le renvoie à Decap via postMessage.
 * @param {{ request: Request, env: Record<string, string> }} context
 */
export async function onRequestGet({ request, env }) {
  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return missingOauthEnvResponse();

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = request.headers.get("Cookie") ?? "";
  const expectedState = cookie.match(/(?:^|;\s*)oauth_state=([^;]+)/)?.[1];

  if (!code) {
    return new Response("Code OAuth manquant.", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (!state || !expectedState || state !== expectedState) {
    return new Response("État OAuth invalide. Relancez la connexion depuis /admin/.", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "user-agent": "nicodev-decap-cms-oauth",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${url.origin}/api/callback`,
      }),
    });
    const result = await tokenResponse.json();

    if (result.error || !result.access_token) {
      return new Response(renderOauthResultPage("error", result), {
        status: 401,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    return new Response(
      renderOauthResultPage("success", {
        token: result.access_token,
        provider: "github",
      }),
      {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "Set-Cookie": "oauth_state=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur OAuth";
    return new Response(message, {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
