import { cookies } from "next/headers";

const COOKIE_NAME = "sec_reader_usage";
const FREE_LIMIT = 3;

export async function checkAndIncrementUsage(): Promise<{
  allowed: boolean;
  remaining: number;
  total: number;
}> {
  const cookieStore = await cookies();
  const usage = cookieStore.get(COOKIE_NAME);

  const currentCount = usage ? parseInt(usage.value) : 0;
  const newCount = currentCount + 1;

  if (newCount > FREE_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      total: currentCount,
    };
  }

  // Set cookie for 30 days
  cookieStore.set(COOKIE_NAME, newCount.toString(), {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: "strict",
  });

  return {
    allowed: true,
    remaining: FREE_LIMIT - newCount,
    total: newCount,
  };
}

export async function getCurrentUsage(): Promise<number> {
  const cookieStore = await cookies();
  const usage = cookieStore.get(COOKIE_NAME);
  return usage ? parseInt(usage.value) : 0;
}
