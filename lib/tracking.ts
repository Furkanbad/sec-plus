import { cookies } from "next/headers";

const COOKIE_NAME = "sec_reader_usage";
const FREE_LIMIT = 3;

interface UsageResult {
  allowed: boolean;
  remaining: number;
  total: number;
}

export async function checkAndIncrementUsage(): Promise<UsageResult> {
  try {
    const cookieStore = await cookies();
    const usage = cookieStore.get(COOKIE_NAME);

    const currentCount = usage?.value ? parseInt(usage.value, 10) : 0;

    // NaN check
    if (isNaN(currentCount)) {
      cookieStore.delete(COOKIE_NAME);
      return checkAndIncrementUsage(); // Retry with clean state
    }

    const newCount = currentCount + 1;

    if (newCount > FREE_LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        total: currentCount,
      };
    }

    cookieStore.set(COOKIE_NAME, newCount.toString(), {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return {
      allowed: true,
      remaining: FREE_LIMIT - newCount,
      total: newCount,
    };
  } catch (error) {
    console.error("Error checking usage:", error);
    // On error, allow access but don't increment
    return {
      allowed: true,
      remaining: 0,
      total: 0,
    };
  }
}

export async function getCurrentUsage(): Promise<number> {
  try {
    const cookieStore = await cookies();
    const usage = cookieStore.get(COOKIE_NAME);

    if (!usage?.value) return 0;

    const count = parseInt(usage.value, 10);
    return isNaN(count) ? 0 : count;
  } catch (error) {
    console.error("Error getting usage:", error);
    return 0;
  }
}
