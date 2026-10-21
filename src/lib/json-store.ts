import "server-only";
import { promises as fs } from "fs";
import path from "path";

/** Folder where all shop data is saved. It is listed in .gitignore. */
export const DATA_DIRECTORY = path.join(process.cwd(), ".data");

/**
 * A tiny "database" that keeps one JSON file per kind of data.
 * It lets the shop create and save data with no database server.
 *
 * - read()    returns the saved data (or the starter data if nothing was saved yet).
 * - update()  changes the data. Updates run one at a time so two requests can never
 *             overwrite each other, and the file is replaced atomically so a crash
 *             can never leave a half-written file.
 *
 * To move to a real database later, replace the stores in src/lib (users.ts,
 * products.ts, ...) that use this class. Nothing else needs to change.
 */
export class JsonFileStore<Data> {
  private readonly filePath: string;
  private readonly createStarterData: () => Data;
  private updateQueue: Promise<unknown> = Promise.resolve();

  constructor(fileName: string, createStarterData: () => Data) {
    this.filePath = path.join(DATA_DIRECTORY, fileName);
    this.createStarterData = createStarterData;
  }

  async read(): Promise<Data> {
    try {
      const fileContents = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(fileContents) as Data;
    } catch {
      return this.createStarterData();
    }
  }

  update<Result>(change: (data: Data) => Result | Promise<Result>): Promise<Result> {
    const result = this.updateQueue.then(async () => {
      const data = await this.read();
      const changeResult = await change(data);
      await this.write(data);
      return changeResult;
    });

    // Keep the queue running even if one update fails.
    this.updateQueue = result.catch(() => undefined);

    return result;
  }

  private async write(data: Data): Promise<void> {
    await fs.mkdir(DATA_DIRECTORY, { recursive: true });

    const temporaryPath = `${this.filePath}.tmp`;
    await fs.writeFile(temporaryPath, JSON.stringify(data, null, 2));
    await fs.rename(temporaryPath, this.filePath);
  }
}
