import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { AppBackToHome } from "../app-back-to-home";

export const metadata: Metadata = {
  title: "Self-help guide",
  description:
    "How Sister Stride works for Steel Sisters & Striders — sign-in, progress, challenges, events, programmes, and community.",
};

const toc = [
  { id: "who-for", label: "Who this is for" },
  { id: "getting-started", label: "Getting started" },
  { id: "home-dashboard", label: "Home dashboard" },
  { id: "member-areas", label: "Main member areas" },
  { id: "walking-5k", label: "Walking to 5K" },
  { id: "events", label: "Events" },
  { id: "pwa", label: "Install as an app" },
  { id: "roles", label: "Coaches, hosts, admins" },
  { id: "safety", label: "Privacy, safety, support" },
  { id: "quick-ref", label: "Quick reference" },
] as const;

const faqs = [
  {
    q: "I forgot my password — what do I do?",
    a: "On the sign-in page, use Forgot password? You need an email address saved on your account to receive the reset link.",
  },
  {
    q: "Why do dates say “today” differently than my calendar?",
    a: "Day boundaries and “today” for logging follow India time (IST). The club stores activity in your local club day in IST.",
  },
  {
    q: "I joined a challenge — where is my rank?",
    a: "Open Challenges from Home or the bottom bar, select the challenge you joined, and open the leaderboard. It updates as the club records progress.",
  },
  {
    q: "I registered for an event — how do I check in?",
    a: "Open Events, choose your session, and use Check in when you are at the venue so your host has an accurate roster.",
  },
  {
    q: "What is SOS in Community?",
    a: "SOS is only for urgent safety situations when your club has connected it to a monitored channel. It is not for general questions — use your club’s usual contact for those.",
  },
  {
    q: "Why don’t I see Coach or Admin menus?",
    a: "Those desks appear only if your account has been given that role. Most members stay in the member home, progress, challenges, events, and community areas.",
  },
] as const;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 rounded-card border border-paper-deep bg-paper-raised p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-xl font-bold uppercase tracking-tight text-transparent bg-clip-text bg-energy sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/80">{children}</div>
    </section>
  );
}

export default async function SelfHelpGuidePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <main
      className="min-h-screen bg-paper px-4 py-8 pb-24 md:pb-10"
      data-testid="app-self-help"
    >
      <div className="mx-auto max-w-3xl space-y-8">
        <AppBackToHome />

        <header className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-magenta">Steel Sisters & Striders · Ballari</p>
          <h1 className="font-display text-3xl uppercase leading-tight text-transparent bg-clip-text bg-energy sm:text-4xl">
            Self-help guide
          </h1>
          <p className="text-sm text-ink/70 md:text-base">
            Sister Stride is the digital home for our women-first fitness community. This guide explains what you can do
            in the app and where to tap — whether you are new or coming back after a break.
          </p>
        </header>

        <nav
          aria-label="On this page"
          className="rounded-card border border-energy/30 bg-gradient-to-br from-paper-raised to-violet/5 p-4 sm:p-5"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-energy">Jump to</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {toc.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-sm font-semibold text-violet-soft underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Section id="who-for" title="Who this is for">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink">Women in and around Ballari</strong> who want structured support for walking,
              running, strength, habits, and wellness.
            </li>
            <li>
              <strong className="text-ink">Members</strong> who track progress, join challenges, follow programmes (Couch
              to 5K / Walking to 5K), book coaches, register for club events, and use the community feed.
            </li>
            <li>
              <strong className="text-ink">Coaches and hosts</strong> when the club assigns those roles — separate desks in
              the same product for sessions and events.
            </li>
          </ul>
        </Section>

        <Section id="getting-started" title="Getting started">
          <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Sign in or join</h3>
          <ul className="list-disc space-y-2 pl-5">
            <li>Use <strong className="text-ink">Sign in</strong> from the club site.</li>
            <li>
              You can use <strong className="text-ink">email and password</strong>,{" "}
              <strong className="text-ink">username and password</strong>, or (where enabled) a magic link or{" "}
              <strong className="text-ink">mobile OTP</strong> via WhatsApp.
            </li>
            <li>
              New here? Use <strong className="text-ink">Join</strong> on the sign-in page to create an account.
            </li>
            <li>
              Forgot your password? <strong className="text-ink">Forgot password?</strong> sends a reset link to your
              email — your account must have an email on file.
            </li>
          </ul>
          <h3 className="pt-2 text-sm font-bold uppercase tracking-wide text-ink">First-time setup</h3>
          <p>
            After your first sign-in, <strong className="text-ink">onboarding</strong> collects profile, health basics,
            activity level, and goals. Completing it unlocks your home dashboard and fitness score fully.
          </p>
        </Section>

        <Section id="home-dashboard" title="Your home dashboard">
          <p>After onboarding, Home summarises your day and what matters next:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink">Steps today</strong> — progress toward your daily step goal.
            </li>
            <li>
              <strong className="text-ink">Fitness score</strong> — club score from your profile and recent logs. Open{" "}
              <Link href="/app/score" className="font-semibold text-violet-soft underline-offset-2 hover:underline">
                Score
              </Link>{" "}
              for detail and recompute.
            </li>
            <li>
              <strong className="text-ink">Weight snapshot</strong> — from your health profile or today’s progress log.
            </li>
            <li>Shortcuts to events, challenges, Walking to 5K, and more when the club has data for you.</li>
          </ul>
          <p>
            Use{" "}
            <Link href="/app/profile" className="font-semibold text-violet-soft underline-offset-2 hover:underline">
              Edit profile
            </Link>{" "}
            on Home to update details and goals later.
          </p>
        </Section>

        <Section id="member-areas" title="Main member areas">
          <div className="overflow-x-auto rounded-lg border border-paper-deep">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead className="bg-paper-muted/80 text-xs font-bold uppercase tracking-wide text-steel">
                <tr>
                  <th className="border-b border-paper-deep px-3 py-2">Area</th>
                  <th className="border-b border-paper-deep px-3 py-2">What you can do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-deep">
                <tr>
                  <td className="px-3 py-2 font-semibold text-ink">
                    <Link href="/app/score" className="text-violet-soft hover:underline">
                      Score
                    </Link>
                  </td>
                  <td className="px-3 py-2">See your level and breakdown. Recompute refreshes from your latest data.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-semibold text-ink">
                    <Link href="/app/progress" className="text-violet-soft hover:underline">
                      Progress
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    Log steps, weight, water, sleep, walks, runs, and workouts for today (IST). View recent trends.
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-semibold text-ink">
                    <Link href="/app/challenges" className="text-violet-soft hover:underline">
                      Challenges
                    </Link>
                  </td>
                  <td className="px-3 py-2">Join club challenges, follow leaderboards, stay accountable with the group.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-semibold text-ink">
                    <Link href="/app/events" className="text-violet-soft hover:underline">
                      Events
                    </Link>
                  </td>
                  <td className="px-3 py-2">Browse sessions, register, open details, check in at the venue.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-semibold text-ink">
                    <Link href="/app/programs/couch-to-5k" className="text-violet-soft hover:underline">
                      C25K
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    Twelve-week Couch to 5K plan, safety notes, and enrolment when the club offers paid signup.
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-semibold text-ink">
                    <Link href="/app/coaches" className="text-violet-soft hover:underline">
                      Coaches
                    </Link>
                  </td>
                  <td className="px-3 py-2">Browse club coaches and send a booking request for a session.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-semibold text-ink">
                    <Link href="/app/community" className="text-violet-soft hover:underline">
                      Community
                    </Link>
                  </td>
                  <td className="px-3 py-2">Wellness articles, posts, likes, comments — and SOS when configured for urgent help.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="walking-5k" title="Walking to 5K registration">
          <p>
            <strong className="text-ink">Walking to 5K</strong> is the structured intake aligned with Couch to 5K. From
            the public site you can open the registration wizard: contact details, health screening, emergency contact, and
            agreements.
          </p>
          <p>
            If you already have an account, sign in first; the wizard knows you are enrolling in the programme. After
            enrolment, reminders may arrive on WhatsApp or email when the club enables those integrations.
          </p>
          <p>
            <Link
              href="/walking-to-5k/register"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-energy/40 bg-energy/10 px-4 text-sm font-bold text-energy transition hover:bg-energy/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              Open Walking to 5K registration
            </Link>
          </p>
        </Section>

        <Section id="events" title="Events — what to expect">
          <ul className="list-disc space-y-2 pl-5">
            <li>Events show type, time in IST, location, and host when available.</li>
            <li>Capacity may be limited; full events stop new registrations unless the host adds spots.</li>
            <li>Use Check in when you arrive so the host has an accurate on-site list.</li>
            <li>Special paid or guest links may be shared separately by your host — follow the link they send.</li>
          </ul>
        </Section>

        <Section id="pwa" title="Install as an app (optional)">
          <p>
            On supported phones and browsers, use <strong className="text-ink">Install</strong> or{" "}
            <strong className="text-ink">Add to Home Screen</strong> from the browser menu. You get a home-screen icon and
            quicker access; you still sign in securely through the web.
          </p>
        </Section>

        <Section id="roles" title="Coaches, hosts, and admins">
          <p>
            Most members only see <strong className="text-ink">member</strong> areas. The same product also powers:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink">Coach</strong> — tools for members and programme enrolments you support.
            </li>
            <li>
              <strong className="text-ink">Host</strong> — create and manage events, registrations, and check-in.
            </li>
            <li>
              <strong className="text-ink">Admin</strong> — club-wide operations and support panels.
            </li>
          </ul>
          <p>You only see those desks if your account has been given the role.</p>
        </Section>

        <Section id="safety" title="Privacy, safety, and support">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Use <strong className="text-ink">Log out</strong> in the header when you finish on a shared device.
            </li>
            <li>Keep community posts respectful and on-topic; the club may moderate per their rules.</li>
            <li>
              <strong className="text-ink">SOS</strong> is for genuine urgent situations when connected to a monitored
              process — not for general questions.
            </li>
            <li>For account issues, phone number changes, or payments, contact your club organisers or their advertised support channel.</li>
          </ul>
        </Section>

        <Section id="quick-ref" title="Quick reference — where to click">
          <div className="overflow-x-auto rounded-lg border border-paper-deep">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead className="bg-paper-muted/80 text-xs font-bold uppercase tracking-wide text-steel">
                <tr>
                  <th className="border-b border-paper-deep px-3 py-2">I want to…</th>
                  <th className="border-b border-paper-deep px-3 py-2">Go to…</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-deep">
                <tr>
                  <td className="px-3 py-2">Sign in or create an account</td>
                  <td className="px-3 py-2">Sign in / Join on the club site</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Fix my password</td>
                  <td className="px-3 py-2">Forgot password? (needs email on account)</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Finish first-time setup</td>
                  <td className="px-3 py-2">Onboarding until complete</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Log today’s steps or weight</td>
                  <td className="px-3 py-2">
                    <Link href="/app/progress" className="font-semibold text-violet-soft hover:underline">
                      Progress
                    </Link>{" "}
                    → save for today
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Update goals or profile</td>
                  <td className="px-3 py-2">
                    <Link href="/app/profile" className="font-semibold text-violet-soft hover:underline">
                      Edit profile
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2">See my fitness score</td>
                  <td className="px-3 py-2">
                    <Link href="/app/score" className="font-semibold text-violet-soft hover:underline">
                      Score
                    </Link>{" "}
                    → recompute
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Join a challenge</td>
                  <td className="px-3 py-2">
                    <Link href="/app/challenges" className="font-semibold text-violet-soft hover:underline">
                      Challenges
                    </Link>{" "}
                    → join
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Book a coach</td>
                  <td className="px-3 py-2">
                    <Link href="/app/coaches" className="font-semibold text-violet-soft hover:underline">
                      Coaches
                    </Link>{" "}
                    → book session
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Register for a session</td>
                  <td className="px-3 py-2">
                    <Link href="/app/events" className="font-semibold text-violet-soft hover:underline">
                      Events
                    </Link>{" "}
                    → register → check in on the day
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Walking to 5K / C25K intake</td>
                  <td className="px-3 py-2">Registration wizard or C25K page</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Post in the feed</td>
                  <td className="px-3 py-2">
                    <Link href="/app/community" className="font-semibold text-violet-soft hover:underline">
                      Community
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <section className="rounded-card border border-paper-deep bg-paper-raised p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-transparent bg-clip-text bg-energy sm:text-2xl">
            Common questions
          </h2>
          <div className="mt-4 space-y-2">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-lg border border-paper-deep bg-paper px-3 py-2 open:border-energy/35 open:bg-gradient-to-br open:from-paper-raised open:to-violet/5"
              >
                <summary className="cursor-pointer text-sm font-bold text-ink [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex w-full items-center justify-between gap-2">
                    {item.q}
                    <span className="text-steel transition group-open:rotate-180" aria-hidden>
                      ▼
                    </span>
                  </span>
                </summary>
                <p className="mt-2 border-t border-paper-deep pt-2 text-sm leading-relaxed text-ink/75">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="border-t border-paper-deep pb-6 pt-4 text-xs text-ink/55">
          <p>
            This guide describes Sister Stride as shipped; your organisers may turn integrations (WhatsApp, email,
            payments, SOS) on or off. For the official link to your club’s site, ask your crew.
          </p>
        </footer>
      </div>
    </main>
  );
}
