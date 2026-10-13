import { Link } from "react-router-dom";
import { usePageMeta } from "../lib/usePageMeta";

/* Who runs JustSeen and where people can reach them about their data */
const operator = "Junior Silva";
/* Leave empty to hide; just the handle, without the @ */
const operatorX = "devnomadJS";
const contactEmail = "info@justseenapp.com";
const lastUpdated = "October 13, 2026";

const Section = ({ title, children }) => (
  <section className="mt-10">
    <h2 className="text-xl font-bold tracking-tight text-fg">{title}</h2>
    <div className="mt-3 flex flex-col gap-3 leading-relaxed text-soft">{children}</div>
  </section>
);

const List = ({ items }) => (
  <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-muted">
    {items.map((item) => (
      <li key={typeof item === "string" ? item : item.key}>{item}</li>
    ))}
  </ul>
);

const Strong = ({ children }) => <strong className="font-semibold text-fg">{children}</strong>;

const ExternalLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer" className="font-medium text-brand-soft underline-offset-2 hover:underline">
    {children}
  </a>
);

/* Public page: Google's sign-in setup and app stores ask for a link to it */
const Privacy = () => {
  usePageMeta({
    title: "Privacy policy",
    description: "How JustSeen handles your data: what we collect, who can see it, and how to delete it. No ads, no tracking.",
    canonicalPath: "/privacy",
  });

  return (
    <article className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <p className="text-sm font-medium text-muted">Last updated {lastUpdated}</p>
      <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-fg">Privacy policy</h1>
      <p className="mt-4 text-lg leading-relaxed text-soft">
        JustSeen is a small app for sharing movie reviews with friends. We collect only what the app needs to work, we
        don't sell your data, and we don't show ads or track you around the web.
      </p>

      <Section title="Who we are">
        <p>
          JustSeen (justseenapp.com) is run by {operator}
          {operatorX && (
            <>
              {" "}
              (<ExternalLink href={`https://x.com/${operatorX}`}>@{operatorX}</ExternalLink> on X)
            </>
          )}
          . For anything about your data, email{" "}
          <ExternalLink href={`mailto:${contactEmail}`}>{contactEmail}</ExternalLink>.
        </p>
      </Section>

      <Section title="What we collect">
        <List
          items={[
            <span key="account">
              <Strong>Your account:</Strong> your email address and password. Passwords are stored scrambled (hashed),
              so nobody, including us, can read them. If you sign in with Google, Google shares your name, email
              address and profile picture with us; we use the name and email.
            </span>,
            <span key="profile">
              <Strong>Your profile:</Strong> your name, username, avatar, and the bio and location if you add them.
            </span>,
            <span key="activity">
              <Strong>What you do in the app:</Strong> the movies you review (star rating, review text and the date you
              watched), your watchlist, the people you follow, your reactions to other people's reviews, and the
              notifications those create.
            </span>,
            <span key="technical">
              <Strong>Technical data:</Strong> like any website, our hosting and database providers keep short-lived
              server logs, which include your IP address and browser type. We use them only to keep the service running
              and secure.
            </span>,
          ]}
        />
      </Section>

      <Section title="Who can see your information">
        <p>
          JustSeen is social, so <Strong>other people with a JustSeen account can see</Strong> your profile, reviews,
          ratings, watchlist, who you follow and who follows you, and your reactions. People who aren't logged in can't
          see any of it.
        </p>
        <p>
          Your email address is never shown to other users. Your notifications are visible only to you.
        </p>
      </Section>

      <Section title="How we use it">
        <List
          items={[
            "To run your account and show you and your friends each other's reviews.",
            "To send emails you need: confirming your address and resetting your password. We don't send marketing emails.",
            "To keep JustSeen secure and fix problems.",
          ]}
        />
        <p>
          We use your information only because you asked for the service by creating an account. We never sell it or
          use it for advertising.
        </p>
      </Section>

      <Section title="Sharing your reviews">
        <p>
          When you share a review, the picture is made on your own device. Nothing is sent to us, and nothing reaches X,
          WhatsApp, Facebook or any other app until you choose to post it there. Once posted, their privacy policies apply.
        </p>
      </Section>

      <Section title="Services we rely on">
        <p>These companies process data for us, only to provide JustSeen:</p>
        <List
          items={[
            <span key="supabase">
              <Strong>Supabase</Strong> stores the database and handles logins (
              <ExternalLink href="https://supabase.com/privacy">privacy policy</ExternalLink>).
            </span>,
            <span key="netlify">
              <Strong>Netlify</Strong> hosts the website (
              <ExternalLink href="https://www.netlify.com/privacy/">privacy policy</ExternalLink>).
            </span>,
            <span key="brevo">
              <Strong>Brevo</Strong> delivers our account emails (
              <ExternalLink href="https://www.brevo.com/legal/privacypolicy/">privacy policy</ExternalLink>).
            </span>,
            <span key="google">
              <Strong>Google</Strong>, only if you choose "Continue with Google" (
              <ExternalLink href="https://policies.google.com/privacy">privacy policy</ExternalLink>).
            </span>,
            <span key="tmdb">
              <Strong>TMDB</Strong> provides movie information and posters. Movie searches go through our server, so TMDB
              doesn't see who searched, but posters load straight from TMDB's servers, which see your IP address (
              <ExternalLink href="https://www.themoviedb.org/privacy-policy">privacy policy</ExternalLink>).
            </span>,
          ]}
        />
        <p>Some of these companies may store data outside your country, with the safeguards their policies describe.</p>
      </Section>

      <Section title="Cookies and storage">
        <p>
          We don't use advertising or analytics cookies, and we don't track you. Your browser stores two things for
          JustSeen: your login, so you stay signed in, and your light or dark mode choice. Both are needed for features
          you asked for, so we don't ask for cookie consent. Logging out removes the login. Our fonts come from our own
          site, not from Google.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          We keep your information for as long as you have an account. When you delete your account, your profile,
          reviews, watchlist, follows, reactions and notifications are deleted straight away. Copies in our providers'
          backups disappear as those backups expire.
        </p>
      </Section>

      <Section title="Your choices and rights">
        <List
          items={[
            <span key="edit">
              <Strong>See and change your information</Strong> any time from your profile.
            </span>,
            <span key="delete">
              <Strong>Delete your account</Strong> yourself: open your profile, edit it, and choose "Delete account".
            </span>,
            <span key="copy">
              <Strong>Get a copy of your data</Strong>, or ask any question about it, by emailing{" "}
              <ExternalLink href={`mailto:${contactEmail}`}>{contactEmail}</ExternalLink>. We'll reply within 30 days.
            </span>,
          ]}
        />
        <p>
          Depending on where you live, you may have further rights, such as objecting to how your data is used or
          complaining to your local data protection authority.
        </p>
      </Section>

      <Section title="Children">
        <p>
          JustSeen is not meant for children under 13, or under the minimum age for online services in your country. If
          you think a child has made an account, let us know and we'll delete it.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we change this policy, we'll update the date at the top. For important changes, we'll let you know in the
          app first.
        </p>
      </Section>

      <div className="mt-12 border-t border-line pt-6">
        <Link to="/" className="text-sm font-semibold text-brand-soft hover:underline">
          ← Back to JustSeen
        </Link>
      </div>
    </article>
  );
};

export default Privacy;
