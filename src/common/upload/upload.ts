import { mkdir } from "node:fs/promises";
import { extname } from "node:path";
import { randomUUID } from "node:crypto";

import { env } from "@/common/config/env";
import {
  payloadTooLarge,
  unsupportedMediaType,
} from "@/common/errors/app-error";

const ensureUploadDir = async () => {
  await mkdir(env.UPLOAD_DIR, { recursive: true });
};

const resolveImageExtension = (file: File) => {
  const extension = extname(file.name || "").toLowerCase();
  if (extension) {
    return extension;
  }

  if (file.type === "image/jpeg") {
    return ".jpg";
  }

  if (file.type === "image/png") {
    return ".png";
  }

  return ".bin";
};

export const saveProfilePicture = async (file: File) => {
  if (!file.type.startsWith("image/")) {
    throw unsupportedMediaType("Only image uploads are supported");
  }

  if (file.size > env.MAX_UPLOAD_SIZE_BYTES) {
    throw payloadTooLarge("File exceeds 10MB upload limit");
  }

  await ensureUploadDir();

  const extension = resolveImageExtension(file);
  const fileName = `${randomUUID()}${extension}`;
  const relativePath = `${env.UPLOAD_DIR}/${fileName}`;

  await Bun.write(relativePath, file);

  const publicBaseUrl = env.PUBLIC_BASE_URL.replace(/\/+$/, "");

  return `${publicBaseUrl}/${relativePath}`;
};
