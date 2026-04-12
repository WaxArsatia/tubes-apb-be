import { unauthorized } from "@/common/errors/app-error";
import { dashboardRepository } from "@/modules/dashboard/dashboard.repository";

export const dashboardService = {
  async getDashboard(userId: string) {
    const profile = await dashboardRepository.findUserProfile(userId);

    if (!profile) {
      throw unauthorized("User does not exist");
    }

    const allTransactions =
      await dashboardRepository.listUserTransactions(userId);

    const totals = allTransactions.reduce(
      (accumulator, transaction) => {
        if (transaction.kind === "Income") {
          accumulator.income += transaction.amount;
        } else {
          accumulator.expense += transaction.amount;
        }

        return accumulator;
      },
      {
        income: 0,
        expense: 0,
      },
    );

    const totalBalance = totals.income - totals.expense;

    return {
      firstName: profile.firstName,
      profilePicture: profile.profilePicture,
      totalBalance,
      budgetRemaining: totalBalance,
      income: totals.income,
      expense: totals.expense,
      recentTransactions: allTransactions.slice(0, 5).map((item) => ({
        name: item.name,
        timestamp: item.timestamp.toISOString(),
        kind: item.kind,
        amount: item.amount,
      })),
    };
  },
};
