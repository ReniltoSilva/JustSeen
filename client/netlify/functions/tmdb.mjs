/* Netlify Function: forwards movie requests to TMDB and adds the secret token,
so the token never ships to the browser. The site calls /api/tmdb/<path>
(see netlify.toml), the same path Vite's dev proxy answers locally. */

/* Only the TMDB endpoints the app uses, so this can't be used as an open proxy */
const allowed = [/^search\/movie$/, /^movie\/\d+$/, /^movie\/\d+\/credits$/];

export default async (request) => {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/(\.netlify\/functions\/tmdb|api\/tmdb)\/?/, "");
  if (!allowed.some((pattern) => pattern.test(path))) {
    return new Response("Not found", { status: 404 });
  }

  const token = process.env.TMDB_TOKEN;
  if (!token) {
    return new Response("TMDB_TOKEN is not set on Netlify", { status: 500 });
  }

  const upstream = await fetch(`https://api.themoviedb.org/3/${path}${url.search}`, {
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": "application/json",
      /* Movie data barely changes: let browsers and Netlify's CDN reuse it for an hour */
      "cache-control": "public, max-age=3600",
    },
  });
};
