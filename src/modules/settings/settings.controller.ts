import type { Context } from "hono";

import { requireAuthenticatedUserId } from "@/common/auth/auth-middleware";
import { unsupportedMediaType } from "@/common/errors/app-error";
import { jsonSuccess } from "@/common/http/responses";
import { settingsService } from "@/modules/settings/settings.service";

export const settingsController = {
  async updateProfile(c: Context) {
    const contentType = c.req.header("content-type") ?? "";

    if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
      throw unsupportedMediaType("Content-Type must be multipart/form-data");
    }

    const userId = requireAuthenticatedUserId(c);
    const formBody = (await c.req.parseBody({ all: true })) as Record<
      string,
      unknown
    >;
    const data = await settingsService.updateProfile(userId, formBody);

    return jsonSuccess(c, data, 200, "Profile updated");
  },
};
