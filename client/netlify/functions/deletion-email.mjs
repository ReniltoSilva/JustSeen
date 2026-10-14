/* Netlify Function: emails someone to confirm their account will be deleted in 30
days, and how to keep it. The website and the mobile app call it right after
"Delete account", with the person's own login (POST /.netlify/functions/deletion-email).

It only ever writes to the logged-in person, about their own account, and only while
it really is waiting to be deleted, so it can't be used to email anyone else.
Needs BREVO_API_KEY in Netlify's environment variables (Brevo -> SMTP & API -> API keys),
and no-reply@justseenapp.com as a verified sender in Brevo. */

const siteUrl = "https://justseenapp.com";
const contactEmail = "info@justseenapp.com";

const escape = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (request) => {
  if (request.method !== "POST") return json(405, { error: "Method not allowed" });

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const brevoKey = process.env.BREVO_API_KEY;
  if (!supabaseUrl || !key || !brevoKey) return json(500, { error: "Email isn't set up on Netlify" });

  const auth = request.headers.get("authorization") ?? "";
  if (!/^Bearer \S+$/.test(auth)) return json(401, { error: "Not logged in" });
  const headers = { apikey: key, authorization: auth };

  /* Who is asking: Supabase checks the login and gives back their email */
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers });
  if (!userResponse.ok) return json(401, { error: "Not logged in" });
  const { id, email } = await userResponse.json();

  /* Their own profile (the database rules let people read their own) */
  const profileResponse = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}&select=name,username,deletion_requested_at`,
    { headers },
  );
  const [profile] = profileResponse.ok ? await profileResponse.json() : [];
  if (!profile?.deletion_requested_at) return json(400, { error: "This account isn't waiting to be deleted" });

  const deleteOn = new Date(Date.parse(profile.deletion_requested_at) + 30 * 86_400_000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const firstName = (profile.name ?? "").split(" ")[0] || "there";

  const text = [
    `Hi ${firstName},`,
    "",
    `We got your request to delete your JustSeen account (@${profile.username}).`,
    "",
    `Your account is now hidden, and it will be deleted for good on ${deleteOn}, together with your reviews, watchlist, follows and reactions.`,
    "",
    `Changed your mind? Just log in before ${deleteOn}, on ${siteUrl} or in the app, and choose "Restore my account". Everything will be just as you left it.`,
    "",
    `If you didn't ask for this, log in and restore your account, then change your password. Questions? Write to ${contactEmail}.`,
    "",
    "The JustSeen team",
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#f4f4f7;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#1a1a22">
<div style="max-width:520px;margin:0 auto;padding:32px 20px">
  <p style="font-size:22px;font-weight:800;margin:0 0 24px">JustSeen</p>
  <div style="background:#fff;border-radius:16px;padding:28px">
    <p style="margin:0 0 16px">Hi ${escape(firstName)},</p>
    <p style="margin:0 0 16px">We got your request to delete your JustSeen account (<strong>@${escape(profile.username)}</strong>).</p>
    <p style="margin:0 0 16px">Your account is now hidden, and it will be <strong>deleted for good on ${escape(deleteOn)}</strong>, together with your reviews, watchlist, follows and reactions.</p>
    <p style="margin:0 0 24px"><strong>Changed your mind?</strong> Just log in before ${escape(deleteOn)}, on the website or in the app, and choose “Restore my account”. Everything will be just as you left it.</p>
    <p style="margin:0 0 24px"><a href="${siteUrl}/login" style="display:inline-block;background:#7c5cff;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:12px">Log in to restore my account</a></p>
    <p style="margin:0;color:#6b6b78;font-size:14px">If you didn't ask for this, log in and restore your account, then change your password. Questions? Write to <a href="mailto:${contactEmail}" style="color:#7c5cff">${contactEmail}</a>.</p>
  </div>
</div></body></html>`;

  const sent = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": brevoKey, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { name: "JustSeen", email: "no-reply@justseenapp.com" },
      to: [{ email, name: profile.name }],
      replyTo: { email: contactEmail },
      subject: `Your JustSeen account will be deleted on ${deleteOn}`,
      textContent: text,
      htmlContent: html,
    }),
  });
  if (!sent.ok) {
    console.error("Brevo refused the email:", sent.status, await sent.text());
    return json(502, { error: "Couldn't send the email" });
  }
  return json(200, { sent: true, deleteOn });
};
