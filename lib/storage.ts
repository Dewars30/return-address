/**
 * Storage helper for S3-compatible storage (Supabase Storage)
 * Handles file uploads and downloads for agent knowledge files
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

let s3Client: S3Client | null = null;

/**
 * Get or initialize S3 client for Supabase Storage
 */
function getS3Client(): S3Client {
  if (!s3Client) {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || "us-east-1";
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "S3 storage not configured. Please set S3_ENDPOINT, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY in .env"
      );
    }

    s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for Supabase Storage
    });
  }

  return s3Client;
}

/**
 * Upload a file to S3-compatible storage (Supabase Storage)
 * @param file Buffer or Uint8Array of file content
 * @param key S3 object key (path within bucket)
 * @param contentType MIME type of the file
 * @returns URL of the uploaded file
 */
export async function uploadFile(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<string> {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("S3_BUCKET_NAME environment variable is not set");
  }

  const client = getS3Client();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await client.send(command);

  // Construct the public URL
  // For Supabase Storage, the URL format is:
  // https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[key]
  const endpoint = process.env.S3_ENDPOINT || "";
  const baseUrl = endpoint.replace("/storage/v1/s3", "");
  return `${baseUrl}/storage/v1/object/public/${bucketName}/${key}`;
}

/**
 * Download a file from S3-compatible storage
 * @param key S3 object key (path within bucket)
 * @returns File content as Buffer
 */
export async function downloadFile(key: string): Promise<Buffer> {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("S3_BUCKET_NAME environment variable is not set");
  }

  const client = getS3Client();

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await client.send(command);

  if (!response.Body) {
    throw new Error("File not found or empty");
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * Delete a file from S3-compatible storage
 * @param key S3 object key (path within bucket)
 */
export async function deleteFile(key: string): Promise<void> {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("S3_BUCKET_NAME environment variable is not set");
  }

  const client = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await client.send(command);
}

/**
 * Generate a storage key for an agent knowledge file
 * Format: agents/[agentId]/files/[fileId]/[fileName]
 */
export function generateFileKey(agentId: string, fileId: string, fileName: string): string {
  // Sanitize fileName to remove any path characters
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `agents/${agentId}/files/${fileId}/${sanitizedFileName}`;
}

