import "server-only";
import { seedCollections } from "@/data/seed-collections";
import { JsonFileStore } from "@/lib/json-store";
import { makeUniqueSlug } from "@/lib/slug";
import type { Collection } from "@/types/shop";

type CollectionData = { collections: Collection[] };

const collectionStore = new JsonFileStore<CollectionData>("collections.json", () => ({
  collections: structuredClone(seedCollections),
}));

export async function listCollections(): Promise<Collection[]> {
  const { collections } = await collectionStore.read();
  return collections;
}

export async function findCollection(slug: string): Promise<Collection | undefined> {
  const collections = await listCollections();
  return collections.find((collection) => collection.slug === slug);
}

export function createCollection(
  input: Omit<Collection, "slug">,
  preferredSlug: string,
): Promise<Collection> {
  return collectionStore.update(({ collections }) => {
    const slug = makeUniqueSlug(
      preferredSlug,
      collections.map((collection) => collection.slug),
    );

    const newCollection: Collection = { ...input, slug };
    collections.push(newCollection);
    return newCollection;
  });
}

export function updateCollection(slug: string, changes: Omit<Collection, "slug">): Promise<boolean> {
  return collectionStore.update(({ collections }) => {
    const index = collections.findIndex((collection) => collection.slug === slug);
    if (index === -1) return false;

    collections[index] = { ...changes, slug };
    return true;
  });
}
