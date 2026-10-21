import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="font-display text-7xl uppercase">This page skipped class</h1>
      <p className="mt-4 text-ink/70">It is not in this building. Try the shop instead.</p>
      <Link href="/" className="mt-8 inline-block bg-ink px-6 py-3 font-semibold text-paper">
        Back to the shop
      </Link>
    </div>
  );
}
