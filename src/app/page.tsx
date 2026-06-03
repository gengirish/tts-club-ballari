import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-paper text-ink flex flex-col items-center justify-center px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-void opacity-90" aria-hidden />
      <div
        className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-violet/30 blur-3xl motion-reduce:opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-steel/20 blur-3xl motion-reduce:opacity-30"
        aria-hidden
      />

      <div className="relative z-10 flex max-w-lg flex-col items-center">
        <div className="relative mb-8 h-44 w-72 sm:h-52 sm:w-80">
          <Image
            src="/brand/logo-full.jpg"
            alt="Steel Sisters & Striders Ballari"
            fill
            priority
            className="object-contain shadow-brand"
            sizes="(max-width: 640px) 288px, 320px"
          />
        </div>
        <p className="max-w-md text-sm font-semibold leading-relaxed text-steel sm:text-base">
          Your women-first fitness home in Ballari — progress, challenges, Couch to 5K, coaches, and the sister circle.
        </p>
        <Link
          href="/login"
          className="mt-10 inline-flex min-h-[52px] cursor-pointer items-center justify-center rounded-full bg-energy px-10 py-3.5 text-sm font-extrabold uppercase tracking-[0.18em] text-white shadow-brand transition-[transform,filter] duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-soft/50 focus-visible:ring-offset-4 focus-visible:ring-offset-paper motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
        >
          Enter app
        </Link>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.28em] text-violet-soft/90">Sister Stride</p>
      </div>
    </main>
  );
}
