import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import path from "path";

// Initialize S3 Client for Cloudflare R2
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2MB limit
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 2MB limit" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name);
    const timestamp = Date.now();
    const uniqueFilename = `profiles/${session.user.id}-${timestamp}${ext}`;

    const bucketName = process.env.R2_BUCKET_NAME;
    const publicEndpoint = process.env.R2_PUBLIC_ENDPOINT;

    if (
      !bucketName ||
      !publicEndpoint ||
      !process.env.R2_ENDPOINT ||
      !process.env.R2_ACCESS_KEY_ID ||
      !process.env.R2_SECRET_ACCESS_KEY
    ) {
      console.error("Missing R2 Config:", {
        bucket: !!bucketName,
        endpoint: !!process.env.R2_ENDPOINT,
        accessKey: !!process.env.R2_ACCESS_KEY_ID,
        secret: !!process.env.R2_SECRET_ACCESS_KEY,
        publicEndpoint: !!publicEndpoint,
      });
      return NextResponse.json(
        {
          error: "Server configuration error: Missing R2 environment variables",
        },
        { status: 500 }
      );
    }

    const params = {
      Bucket: bucketName,
      Key: uniqueFilename,
      Body: buffer,
      ContentType: file.type,
      // ACL: "public-read", // Removed as R2 often doesn't need/support this field in standard implementation
    };

    await s3.send(new PutObjectCommand(params));

    // Ensure publicEndpoint ends with a slash if not present
    const cleanEndpoint = publicEndpoint.endsWith("/")
      ? publicEndpoint
      : `${publicEndpoint}/`;
    const fileUrl = `${cleanEndpoint}${uniqueFilename}`;

    return NextResponse.json({ fileUrl });
  } catch (error: any) {
    console.error("Upload error detailed:", error);
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` },
      { status: 500 }
    );
  }
}
