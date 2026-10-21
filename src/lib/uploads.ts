import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { DATA_DIRECTORY } from "@/lib/json-store";

/**
 * Photos uploaded by the admin are saved in .data/uploads and served by the
 * route /uploads/[filename]. (Files added to /public after the site is built
 * are not served by Next.js, so uploads live outside /public.)
 */

const UPLOAD_DIRECTORY = path.join(DATA_DIRECTORY, "uploads");
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB

type ImageType = { extension: "jpg" | "png" | "webp"; contentType: string };

const IMAGE_TYPE_BY_EXTENSION: Record<string, ImageType> = {
  jpg: { extension: "jpg", contentType: "image/jpeg" },
  png: { extension: "png", contentType: "image/png" },
  webp: { extension: "webp", contentType: "image/webp" },
};

/** Detects the real image type from the first bytes of the file, not from its name. */
function detectImageType(bytes: Buffer): ImageType | null {
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (isJpeg) return IMAGE_TYPE_BY_EXTENSION.jpg;

  const isPng = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (isPng) return IMAGE_TYPE_BY_EXTENSION.png;

  const isWebp = bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  if (isWebp) return IMAGE_TYPE_BY_EXTENSION.webp;

  return null;
}

export type UploadResult = { path: string } | { error: string };

/** Validates and saves an uploaded photo. Returns its public path, for example "/uploads/abc.jpg". */
export async function saveUploadedImage(file: File): Promise<UploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "The photo is larger than 4 MB." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const imageType = detectImageType(bytes);

  if (!imageType) {
    return { error: "Please upload a JPG, PNG or WebP photo." };
  }

  const fileName = `${crypto.randomUUID()}.${imageType.extension}`;

  await fs.mkdir(UPLOAD_DIRECTORY, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIRECTORY, fileName), bytes);

  return { path: `/uploads/${fileName}` };
}

const UPLOAD_FILE_NAME_PATTERN = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;

/** Reads an uploaded photo for the /uploads route. Returns null if it does not exist. */
export async function readUploadedImage(
  fileName: string,
): Promise<{ bytes: Buffer; contentType: string } | null> {
  // The strict pattern also blocks path tricks such as "../".
  const match = UPLOAD_FILE_NAME_PATTERN.exec(fileName);
  if (!match) return null;

  try {
    const bytes = await fs.readFile(path.join(UPLOAD_DIRECTORY, fileName));
    return { bytes, contentType: IMAGE_TYPE_BY_EXTENSION[match[1]].contentType };
  } catch {
    return null;
  }
}
