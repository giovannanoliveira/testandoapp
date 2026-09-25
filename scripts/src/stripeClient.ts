import { ReplitConnectors } from "@replit/connectors-sdk";

export async function stripeRequest<T>(
  path: string,
  options?: { method?: string; headers?: Record<string, string>; body?: string },
): Promise<T> {
  const response = await new ReplitConnectors().proxy("stripe", path, options);
  const data = (await response.json()) as unknown;
  if (!response.ok) {
    const errorData = data as { error?: { message?: string } };
    throw new Error(
      errorData.error?.message ?? `Stripe respondeu com status ${response.status}`,
    );
  }
  return data as T;
}