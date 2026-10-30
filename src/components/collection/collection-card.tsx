import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/types/shop";

export function CollectionCard({
  collection,
  pieceCount,
}: {
  collection: Collection;
  pieceCount: number;
}) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border-2 border-ink bg-mist transition duration-300 hover:-translate-y-1 hover:hard-shadow"
    >
      <Image
        src={collection.image}
        alt={`${collection.name} collection`}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Dark gradient so the white title stays readable on any photo. */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="text-sm font-bold uppercase tracking-wide text-gold">
          {collection.label && `${collection.label} · `}
          {pieceCount} {pieceCount === 1 ? "piece" : "pieces"}
        </p>
        <h3 className="font-display text-5xl leading-none">{collection.name}</h3>
        <p className="mt-2 text-sm font-semibold opacity-0 transition group-hover:opacity-100">Open the collection →</p>
      </div>
    </Link>
  );
}
