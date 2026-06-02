import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-energy text-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-magenta-soft font-extrabold tracking-[0.22em] text-xs uppercase mb-4">
        SSS Club · Ballari
      </p>
      <h1 className="font-display text-5xl sm:text-7xl leading-none uppercase">
        Steel Sisters
        <br />& Striders
      </h1>
      <p className="mt-5 max-w-md text-white/85">
        Your fitness community — track progress, join challenges, and become healthier every day.
      </p>
      <Link
        href="/login"
        className="mt-8 inline-block cursor-pointer rounded-full bg-white px-8 py-4 font-extrabold text-violet shadow-lg shadow-black/15 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-violet motion-reduce:hover:translate-y-0 motion-reduce:transition-none"
      >
        Get started →
      </Link>
    </main>
  );
}
