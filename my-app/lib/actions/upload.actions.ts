"use server";

import { s3Client } from "@/lib/b2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop();
    const fileName = `${randomUUID()}.${fileExtension}`;
    const contentType = file.type;

    const command = new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Construct the public URL
    // For B2, it's usually https://<BucketName>.s3.<Region>.backblazeb2.com/<FileName>
    // Or if friendly URL is enabled: https://f000.backblazeb2.com/file/<BucketName>/<FileName>
    // Using the endpoint from env is safest if it includes the bucket, but standard S3 endpoint usually doesn't.
    // Let's assume standard virtual-hosted-style or path-style.
    // B2 Endpoint format: s3.us-west-000.backblazeb2.com
    
    // Using path style for B2 S3 compatibility usually works best:
    // https://s3.us-west-000.backblazeb2.com/<BucketName>/<FileName>
    
    const endpoint = process.env.B2_ENDPOINT?.replace('https://', '');
    const url = `https://${endpoint}/${process.env.B2_BUCKET_NAME}/${fileName}`;

    return { success: true, url };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Upload failed" };
  }
}
