import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateSignedUploadUrl } from "@/lib/storage/upload-package";

/** POST /api/upload/presigned — get a signed URL for package upload (authenticated) */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { filename, slug, version } = body;

    if (!filename || typeof filename !== "string") {
      return NextResponse.json({ error: "filename is required", field: "filename" }, { status: 400 });
    }
    if (!filename.endsWith(".clawagent")) {
      return NextResponse.json({ error: "filename must end with .clawagent", field: "filename" }, { status: 400 });
    }
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug is required", field: "slug" }, { status: 400 });
    }
    if (!version || typeof version !== "string") {
      return NextResponse.json({ error: "version is required", field: "version" }, { status: 400 });
    }

    const { uploadUrl, key } = await generateSignedUploadUrl(slug, version);

    return NextResponse.json({ uploadUrl, packageKey: key });
  } catch (err) {
    console.error("[POST /api/upload/presigned]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
