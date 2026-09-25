import { ReplitConnectors } from "@replit/connectors-sdk";

export async function stripeRequest<T>(
  path: string,
  options?: { method?: string; headers?: Record<string, string>; body?: string },
): Promise<T> {
  const connectors = new ReplitConnectors();
  const response = await connectors.proxy("stripe", path, options);
  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : {};

  if (!response.ok) {
    const errorData = data as { error?: { message?: string } };
    throw new Error(
      errorData.error?.message ?? `Stripe respondeu com status ${response.status}`,
    );
  }

  return data as T;
}