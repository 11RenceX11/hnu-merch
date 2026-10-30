import { readUploadedImage } from "@/lib/uploads";

/** Serves photos uploaded by the admin. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const image = await readUploadedImage(filename);

  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.contentType,
      "X-Content-Type-Options": "nosniff",
      // File names are random and never reused, so browsers can keep them for a year.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
