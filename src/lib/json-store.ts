import "server-only";
import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import path from "path";

/** Folder used for saved data while developing on your own computer. It is listed in .gitignore. */
export const DATA_DIRECTORY = path.join(process.cwd(), ".data");

/**
 * Where the shop's data (products, collections, sales, orders...) is kept.
 *
 *  - On your computer: JSON files in the .data folder. Nothing to set up.
 *  - On Vercel: an Upstash Redis database. Vercel cannot keep files between
 *    requests, so the shop needs somewhere permanent to save data.
 *
 * The rest of the app does not care which one is used.
 */
type StorageBackend = {
  /** Returns the saved text, or null when nothing was saved yet. */
  read(key: string): Promise<string | null>;
  /**
   * Saves `nextText`, but only if the saved text is still `expectedText`.
   * Returns false when another request changed it first (the caller then tries again).
   */
  writeIfUnchanged(key: string, expectedText: string | null, nextText: string): Promise<boolean>;
};

// ---------------------------------------------------------------
// Backend 1: JSON files (local development)
// ---------------------------------------------------------------

const fileBackend: StorageBackend = {
  async read(key) {
    try {
      return await fs.readFile(path.join(DATA_DIRECTORY, key), "utf8");
    } catch {
      return null;
    }
  },

  async writeIfUnchanged(key, _expectedText, nextText) {
    await fs.mkdir(DATA_DIRECTORY, { recursive: true });

    // Write to a temporary file first, then rename, so a crash never leaves a half-written file.
    const filePath = path.join(DATA_DIRECTORY, key);
    await fs.writeFile(`${filePath}.tmp`, nextText);
    await fs.rename(`${filePath}.tmp`, filePath);

    // On one computer the JsonStore queue already makes updates happen one at a time.
    return true;
  },
};

// ---------------------------------------------------------------
// Backend 2: Upstash Redis (Vercel)
// ---------------------------------------------------------------

/** A small Redis script: "save only if nobody changed it since I read it". */
const SAVE_IF_UNCHANGED_SCRIPT = `
local current = redis.call('GET', KEYS[1])
if (current == false and ARGV[1] == '') or current == ARGV[1] then
  redis.call('SET', KEYS[1], ARGV[2])
  return 1
end
return 0
`;

function createRedisBackend(url: string, token: string): StorageBackend {
  // We store plain text, so the client must not try to convert it to and from JSON itself.
  const redis = new Redis({ url, token, automaticDeserialization: false });

  return {
    async read(key) {
      const savedText = await redis.get<string>(`hnu:${key}`);
      return savedText ?? null;
    },

    async writeIfUnchanged(key, expectedText, nextText) {
      const result = await redis.eval(SAVE_IF_UNCHANGED_SCRIPT, [`hnu:${key}`], [expectedText ?? "", nextText]);
      return result === 1;
    },
  };
}

const missingStorageBackend: StorageBackend = {
  async read() {
    return null;
  },

  async writeIfUnchanged() {
    throw new Error(
      "Storage is not set up. Connect an Upstash Redis database to this Vercel project (see docs/3-DEPLOY-GUIDE.md).",
    );
  },
};

let redisBackend: StorageBackend | undefined;

function getBackend(): StorageBackend {
  // Vercel's Upstash integration sets the KV_* names. A hand-made database uses the UPSTASH_* names.
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (url && token) {
    redisBackend ??= createRedisBackend(url, token);
    return redisBackend;
  }

  // On Vercel without a database, visitors can still browse the starter data.
  // Saving is not possible, so we say exactly what to do.
  if (process.env.VERCEL) return missingStorageBackend;

  return fileBackend;
}

// ---------------------------------------------------------------
// The store the rest of the app uses
// ---------------------------------------------------------------

const MAX_WRITE_ATTEMPTS = 5;

/**
 * One kind of saved data, for example all products.
 *  - read()    returns the saved data (or the starter data if nothing was saved yet).
 *  - update()  changes the data. Changes happen safely even when several
 *              visitors act at the same moment.
 */
export class JsonStore<Data> {
  private readonly key: string;
  private readonly createStarterData: () => Data;
  private updateQueue: Promise<unknown> = Promise.resolve();

  constructor(key: string, createStarterData: () => Data) {
    this.key = key;
    this.createStarterData = createStarterData;
  }

  async read(): Promise<Data> {
    const savedText = await getBackend().read(this.key);
    return savedText ? (JSON.parse(savedText) as Data) : this.createStarterData();
  }

  update<Result>(change: (data: Data) => Result | Promise<Result>): Promise<Result> {
    const result = this.updateQueue.then(() => this.runUpdate(change));

    // Keep the queue running even if one update fails.
    this.updateQueue = result.catch(() => undefined);

    return result;
  }

  private async runUpdate<Result>(change: (data: Data) => Result | Promise<Result>): Promise<Result> {
    const backend = getBackend();

    for (let attempt = 1; attempt <= MAX_WRITE_ATTEMPTS; attempt++) {
      const savedText = await backend.read(this.key);
      const data = savedText ? (JSON.parse(savedText) as Data) : this.createStarterData();

      const changeResult = await change(data);

      const wasSaved = await backend.writeIfUnchanged(this.key, savedText, JSON.stringify(data));
      if (wasSaved) return changeResult;

      // Someone else saved in between. Read the newest data and apply our change again.
    }

    throw new Error(`Could not save "${this.key}" after ${MAX_WRITE_ATTEMPTS} tries.`);
  }
}
