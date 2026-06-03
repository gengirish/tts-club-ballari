import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-paper px-4 py-10 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 motion-reduce:opacity-25"
        aria-hidden
      >
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-energy-soft blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-violet/20 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <div className="rounded-screen border border-white/60 bg-white/90 p-6 shadow-xl shadow-violet/10 backdrop-blur-md sm:p-8">
          <h1 className="font-display text-3xl uppercase leading-tight text-violet sm:text-4xl">
            Check your email
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            A sign-in link was sent to the address you entered. Open the email and tap the link to finish signing in.
            The link works best on this device and expires after a short time.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            If nothing arrives in a minute or two, look in spam or promotions, then try again from the login page.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-full border border-paper-deep bg-white px-4 py-3 text-center text-sm font-bold text-ink/85 transition-colors duration-200 hover:border-violet/35 hover:bg-paper-deep/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
