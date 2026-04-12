import type { Context } from "hono";

import { requireAuthenticatedUserId } from "@/common/auth/auth-middleware";
import { jsonSuccess } from "@/common/http/responses";
import { dashboardService } from "@/modules/dashboard/dashboard.service";

export const dashboardController = {
  async getDashboard(c: Context) {
    const userId = requireAuthenticatedUserId(c);
    const data = await dashboardService.getDashboard(userId);
    return jsonSuccess(c, data, 200, "Dashboard fetched");
  },
};
