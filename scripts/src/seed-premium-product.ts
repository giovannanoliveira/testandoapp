import { stripeRequest } from "./stripeClient";

const OFFER_KEY = "plano-premium-one-time-brl-1990";

async function seedPremiumProduct() {
  const query = encodeURIComponent(
    `metadata['offer_key']:'${OFFER_KEY}' AND active:'true'`,
  );
  const existingProducts = await stripeRequest<{ data: Array<{ id: string }> }>(
    `/v1/products/search?query=${query}&limit=10`,
  );

  const product =
    existingProducts.data[0] ??
    (await stripeRequest<{ id: string }>("/v1/products", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        name: "Plano Premium",
        description: "Pagamento único do Plano Premium do Vizinhança Real",
        "metadata[app]": "vizinhanca-real",
        "metadata[offer_key]": OFFER_KEY,
      }).toString(),
    }));

  const prices = await stripeRequest<{
    data: Array<{ id: string; currency: string; unit_amount: number | null }>;
  }>(
    `/v1/prices?product=${encodeURIComponent(product.id)}&active=true&type=one_time&limit=100`,
  );
  const existingPrice = prices.data.find(
    (price) => price.currency === "brl" && price.unit_amount === 1990,
  );

  const price =
    existingPrice ??
    (await stripeRequest<{ id: string }>("/v1/prices", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        product: product.id,
        unit_amount: "1990",
        currency: "brl",
        "metadata[offer_key]": OFFER_KEY,
      }).toString(),
    }));

  console.log(`Plano Premium pronto: produto ${product.id}, preço ${price.id}`);
}

seedPremiumProduct().catch((error) => {
  console.error(error);
  process.exit(1);
});