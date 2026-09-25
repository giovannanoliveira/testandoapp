import { getStripe } from "./stripeClient";

const OFFER_KEY = "plano-premium-one-time-brl-1990";

async function seedPremiumProduct() {
  const stripe = getStripe();
  const existingProducts = await stripe.products.search({
    query: `metadata['offer_key']:'${OFFER_KEY}' AND active:'true'`,
    limit: 10,
  });

  const product =
    existingProducts.data[0] ??
    (await stripe.products.create({
      name: "Plano Premium",
      description: "Pagamento único do Plano Premium do Vizinhança Real",
      metadata: { app: "vizinhanca-real", offer_key: OFFER_KEY },
    }));

  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    type: "one_time",
    limit: 100,
  });
  const existingPrice = prices.data.find(
    (price) => price.currency === "brl" && price.unit_amount === 1990,
  );

  const price =
    existingPrice ??
    (await stripe.prices.create({
      product: product.id,
      unit_amount: 1990,
      currency: "brl",
      metadata: { offer_key: OFFER_KEY },
    }));

  console.log(`Plano Premium pronto: produto ${product.id}, preço ${price.id}`);
}

seedPremiumProduct().catch((error) => {
  console.error(error);
  process.exit(1);
});
