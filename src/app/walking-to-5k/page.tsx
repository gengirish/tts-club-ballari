import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Walking to 5K",
  description:
    "Steel Sisters & Striders Ballari — 12-week Walking to 5K programme: coached sessions, safety (PAR-Q), attendance mindset, and the full Sister Stride app.",
};

const features = [
  {
    title: "12-week path to 5 km",
    body: "Structured progression from walk–jog intervals to a confident 5K, aligned with our in-app Couch to 5K curriculum and reminders.",
  },
  {
    title: "Group rhythm — Tue · Thu · Sun",
    body: "Train with the strider circle on fixed session days so accountability and energy stay high all season.",
  },
  {
    title: "Attendance & progress",
    body: "Digital progress logging, weekly structure, and visibility on your streak — the same discipline as the paper tracker, without the paperwork.",
  },
  {
    title: "PAR-Q & medical safety",
    body: "Built-in health declaration (heart, chest pain, surgery, medication) so coaches know how to support you safely.",
  },
  {
    title: "Emergency contacts",
    body: "On-file emergency name, relationship, and phone — mirrored from the club form — for every group session.",
  },
  {
    title: "Orientation checklist",
    body: "Registration, medical form, emergency details, and WhatsApp group onboarding — all captured in one guided flow.",
  },
  {
    title: "Coaches & bookings",
    body: "After you join, book running and walking coaches, see ratings, and level up with 1:1 guidance inside the app.",
  },
  {
    title: "Challenges & community",
    body: "Steps challenges, community feed, likes and comments — the wider SSS Club ecosystem beyond the programme weeks.",
  },
  {
    title: "SOS & wellness",
    body: "Safety tooling and women’s wellness content — part of the same member home you unlock when you register.",
  },
];

export default function WalkingTo5kLandingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-violet/25 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-[22rem] w-[22rem] rounded-full bg-steel/15 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-paper-deep/80 bg-paper-raised/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <span className="relative block h-11 w-36 shrink-0">
              <Image
                src="/brand/logo-full.jpg"
                alt="Steel Sisters and Striders Ballari"
                fill
                className="object-contain object-left"
                sizes="144px"
                priority
              />
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Link
              href="/SSS_Walking_to_5K_Form.pdf"
              className="rounded-full border border-paper-deep px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-ink/85 transition-colors hover:border-violet/40 hover:bg-paper-muted/60"
            >
              PDF form
            </Link>
            <Link
              href="/login?callbackUrl=/walking-to-5k/register"
              className="rounded-full border border-paper-deep px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-ink/85 transition-colors hover:border-violet/40 hover:bg-paper-muted/60"
            >
              Sign in
            </Link>
            <Link
              href="/walking-to-5k/register"
              className="rounded-full bg-energy px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-md shadow-violet/25 transition-[filter,transform] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              Register online
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.35em] text-violet-soft">
          Steel Sisters & Striders · Ballari
        </p>
        <h1 className="mt-3 text-center font-display text-4xl font-bold uppercase leading-tight tracking-tight text-violet sm:text-5xl">
          Walking to 5K
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-ink/75 sm:text-lg">
          Move from walking to your first 5K with coached group sessions, medical safety checks, and the full Sister Stride
          digital experience — the online path for what you used to do only on paper.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/walking-to-5k/register"
            className="inline-flex min-h-[52px] w-full max-w-xs cursor-pointer items-center justify-center rounded-full bg-energy px-10 py-3.5 text-sm font-extrabold uppercase tracking-[0.16em] text-white shadow-brand transition-[transform,filter] duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-soft/50 focus-visible:ring-offset-4 focus-visible:ring-offset-paper sm:w-auto"
          >
            Start registration
          </Link>
          <Link
            href="/login?callbackUrl=/app/programs/couch-to-5k"
            className="inline-flex min-h-[52px] w-full max-w-xs items-center justify-center rounded-full border border-steel/40 bg-paper-raised/90 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-ink/90 backdrop-blur-sm transition-colors hover:border-violet/35 hover:bg-paper-muted/80 sm:w-auto"
          >
            Preview programme hub
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-ink/50">
          Preview opens after sign-in. Online registration below creates your account and enrols you in one step.
        </p>
      </section>

      <section className="relative z-10 border-t border-paper-deep/60 bg-paper-raised/40 py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-violet sm:text-3xl">
            What you get
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
            This landing page mirrors the spirit of the official PDF — then connects you to authentication, digital PAR-Q,
            emergency contacts, and the same Couch to 5K journey your coaches run in Ballari.
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <li
                key={f.title}
                className="rounded-card border border-paper-deep/90 bg-paper-raised/90 p-5 shadow-lg shadow-black/20"
              >
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-steel-bright">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/72">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="rounded-screen border border-violet/25 bg-gradient-to-br from-violet/10 via-paper-raised/95 to-paper-muted/80 p-8 sm:p-10">
          <h2 className="font-display text-xl font-bold uppercase text-violet sm:text-2xl">Ready to join?</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/75">
            Create your secure account (email or username + password, or sign in from the login page), then
            complete the Walking to 5K form digitally. You will land in the Couch to 5K programme area with your enrolment on
            file.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/walking-to-5k/register"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-energy px-8 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-md hover:brightness-105"
            >
              Register with authentication
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-paper-deep px-6 py-3 text-sm font-bold text-ink/85 hover:bg-paper-muted/50"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
