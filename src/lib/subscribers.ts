import "server-only";
import { JsonFileStore } from "@/lib/json-store";

type SubscriberData = { subscribers: { email: string; createdAt: string }[] };

const subscriberStore = new JsonFileStore<SubscriberData>("subscribers.json", () => ({
  subscribers: [],
}));

/** Saves an email for drop alerts. Saving the same email twice is fine. */
export function addSubscriber(email: string): Promise<void> {
  return subscriberStore.update(({ subscribers }) => {
    if (subscribers.some((subscriber) => subscriber.email === email)) return;
    subscribers.push({ email, createdAt: new Date().toISOString() });
  });
}
