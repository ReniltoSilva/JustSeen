/* Netlify Function: the page behind a shared review's link, justseenapp.com/r/<review id>
(see netlify.toml). WhatsApp, X and Facebook read the og: tags without running any
JavaScript, so the page is built here, with the review's own preview picture.
People who open the link see the review card and an invitation to join. */

const siteUrl = "https://justseenapp.com";

/* Text from the database goes into HTML, so make it harmless first */
const escape = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

const page = ({ status = 200, title, description, image, url, body }) =>
  new Response(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}" />
<meta name="robots" content="noindex" />
<meta name="theme-color" content="#09090d" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="JustSeen" />
<meta property="og:title" content="${escape(title)}" />
<meta property="og:description" content="${escape(description)}" />
<meta property="og:url" content="${escape(url)}" />
<meta property="og:image" content="${escape(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${escape(image)}" />
<style>
  * { box-sizing: border-box; margin: 0; }
  body { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px;
    padding: 32px 16px; background: radial-gradient(circle at 20% 0%, #2a1f6b 0%, #0b0a14 55%); color: #f5f5f7;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; text-align: center; }
  a.brand { color: #f5f5f7; text-decoration: none; font-weight: 800; font-size: 22px; letter-spacing: -0.3px; }
  img.card { width: 100%; max-width: 720px; border-radius: 18px; box-shadow: 0 30px 80px rgba(0,0,0,.55); }
  h1 { font-size: 22px; line-height: 1.3; max-width: 560px; }
  p { color: #bdbdc9; max-width: 520px; line-height: 1.5; }
  .actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
  .button { display: inline-block; padding: 13px 22px; border-radius: 12px; font-weight: 600; font-size: 15px; text-decoration: none; }
  .primary { background: #7c5cff; color: #fff; box-shadow: 0 10px 30px rgba(124,92,255,.35); }
  .secondary { background: rgba(255,255,255,.08); color: #fff; border: 1px solid rgba(255,255,255,.15); }
  small { color: #8c8c9a; }
</style>
</head>
<body>
<a class="brand" href="${siteUrl}">JustSeen</a>
${body}
</body>
</html>`,
    {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        /* Short, so an edited review or a new picture shows up quickly */
        "cache-control": "public, max-age=300",
      },
    },
  );

const notFound = () =>
  page({
    status: 404,
    title: "JustSeen: movies are better with friends",
    description: "Share quick movie reviews with your friends and see what they're watching.",
    image: `${siteUrl}/og-image.png`,
    url: siteUrl,
    body: `<h1>This review isn't available</h1>
<p>It may have been deleted, or it was never shared.</p>
<div class="actions"><a class="button primary" href="${siteUrl}">Go to JustSeen</a></div>`,
  });

export default async (request) => {
  const id = new URL(request.url).pathname.split("/").filter(Boolean).pop() ?? "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return notFound();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !key) return new Response("Supabase settings are missing on Netlify", { status: 500 });

  /* Only reviews their author has shared come back (get_shared_review checks shared_at) */
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_shared_review`, {
    method: "POST",
    headers: { apikey: key, "content-type": "application/json" },
    body: JSON.stringify({ review_id: id }),
  });
  if (!response.ok) return notFound();
  const [review] = await response.json();
  if (!review) return notFound();

  const rating = Number(review.rating);
  const firstName = (review.author_name ?? "").split(" ")[0] || "A friend";
  const title = `${review.author_name} gave ${review.title} ${rating}/5 on JustSeen`;
  const description = review.review
    ? `“${review.review}”`
    : `See what ${firstName} thought of ${review.title}, and share your own reviews with friends.`;
  /* ?v= changes each time it's shared again, so apps fetch the new picture */
  const image = `${supabaseUrl}/storage/v1/object/public/share-cards/${review.author_id}/${review.id}.jpg?v=${Date.parse(review.shared_at)}`;
  const url = `${siteUrl}/r/${review.id}`;

  return page({
    title,
    description,
    image,
    url,
    body: `<img class="card" src="${escape(image)}" alt="${escape(`${review.author_name}'s review of ${review.title}`)}" />
<h1>${escape(firstName)} wants to know what you think of ${escape(review.title)}</h1>
<p>JustSeen is a free app for sharing quick movie reviews with your friends. No critic scores, just people whose taste you trust.</p>
<div class="actions">
  <a class="button primary" href="${siteUrl}/?mode=signup">Create your free account</a>
  <a class="button secondary" href="${siteUrl}/movie/${review.movie_id}">Open in JustSeen</a>
</div>
<small>Shared by @${escape(review.author_username)}</small>`,
  });
};
