import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center text-ink">
      <div className="relative z-10 flex max-w-sm flex-col items-center">
        <h1 className="text-xs font-semibold uppercase tracking-[0.35em] text-ink/50">Sister Stride</h1>
        <div className="relative mt-6 h-36 w-56 sm:h-40 sm:w-64">
          <Image
            src="/brand/logo-full.jpg"
            alt="Steel Sisters & Striders Ballari"
            fill
            priority
            className="object-contain"
            sizes="(max-width: 640px) 224px, 256px"
          />
        </div>
        <p className="mt-6 text-sm leading-relaxed text-ink/65">
          Women-first fitness in Ballari — programs, coaches, and your strider circle.
        </p>
        <Link
          href="/login"
          className="mt-10 inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-full bg-energy px-8 text-sm font-semibold text-white transition-[filter] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          Sign in
        </Link>
        <Link
          href="/walking-to-5k/register"
          className="mt-5 text-sm text-ink/50 underline-offset-4 transition-colors hover:text-ink/70 hover:underline"
        >
          Walking to 5K registration
        </Link>
      </div>
    </main>
  );
}
