import "server-only";
import { put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { DATA_DIRECTORY } from "@/lib/json-store";

/**
 * Where uploaded photos go:
 *  - On Vercel: Vercel Blob (permanent file storage). The saved path is a full https address.
 *  - On your computer: .data/uploads, served by the route /uploads/[filename].
 *    (Files added to /public after the site is built are not served by Next.js,
 *    so local uploads live outside /public.)
 */

const UPLOAD_DIRECTORY = path.join(DATA_DIRECTORY, "uploads");
// Vercel limits a request to 4.5 MB, so photos are limited to 3 MB.
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024; // 3 MB

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
    return { error: "The photo is larger than 3 MB. Please use a smaller one." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const imageType = detectImageType(bytes);

  if (!imageType) {
    return { error: "Please upload a JPG, PNG or WebP photo." };
  }

  const fileName = `${crypto.randomUUID()}.${imageType.extension}`;

  // On Vercel: save to Vercel Blob. Its token is added automatically when a Blob store is connected.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`products/${fileName}`, bytes, {
      access: "public",
      contentType: imageType.contentType,
    });

    return { path: blob.url };
  }

  if (process.env.VERCEL) {
    return { error: "Photo storage is not set up. Connect a Vercel Blob store (see docs/3-DEPLOY-GUIDE.md)." };
  }

  // On your computer: save to the .data/uploads folder.
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
