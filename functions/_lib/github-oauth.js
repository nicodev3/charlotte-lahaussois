/**
 * Page HTML renvoyée à Decap après l’échange OAuth GitHub (protocole postMessage).
 * @param {"success" | "error"} status
 * @param {Record<string, unknown>} content
 */
export function renderOauthResultPage(status, content) {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Connexion CMS</title>
  </head>
  <body>
    <p>Authentification GitHub… vous pouvez fermer cette fenêtre si elle ne se ferme pas toute seule.</p>
    <script>
      (function () {
        var authMessage = ${JSON.stringify(message)};
        function receiveMessage(event) {
          window.opener.postMessage(authMessage, event.origin);
          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script>
  </body>
</html>`;
}

export function missingOauthEnvResponse() {
  return new Response(
    "GITHUB_CLIENT_ID et GITHUB_CLIENT_SECRET doivent être définis dans les variables d’environnement Cloudflare Pages.",
    { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } },
  );
}
