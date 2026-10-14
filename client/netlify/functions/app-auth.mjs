/* Netlify Function: the step between Google sign-in and the mobile app
(justseenapp.com/app-auth?to=<app address>, see netlify.toml).

Supabase only returns people to addresses on its allow list, and app addresses like
exp://192.168.1.20:8081 (Expo Go) change with the Wi-Fi network. The website is
always allowed, so the app asks to come back here, and this sends the browser on to
the app. The login travels after the # in the address, which browsers keep across a
redirect and never send to a server, so it passes through without this function
seeing it.

Only the JustSeen app and Expo Go on a home network are allowed as destinations, so
nobody can use this page to send someone's login to another website. */

const privateHost =
  /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/;

const allowed = (to) => {
  if (/^justseen:\/\//.test(to)) return true;
  const match = /^exp:\/\/([^/?#]+)/.exec(to);
  return Boolean(match && privateHost.test(match[1]));
};

const page = (status, message) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>JustSeen</title><meta name="robots" content="noindex" />
<style>body{min-height:100vh;margin:0;display:grid;place-items:center;padding:24px;background:#09090d;color:#f5f5f7;font-family:system-ui,sans-serif;text-align:center}p{color:#bdbdc9;max-width:340px;line-height:1.5}</style>
</head><body><div><h1>JustSeen</h1><p>${message}</p></div></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );

export default async (request) => {
  const to = new URL(request.url).searchParams.get("to") ?? "";
  if (!allowed(to)) return page(400, "This sign-in link isn't for the JustSeen app. Open the app and try again.");

  /* Back to the app. Browsers keep the #login part of the address across this redirect */
  return new Response(null, { status: 302, headers: { location: to, "cache-control": "no-store" } });
};
