import { Router, type IRouter, type Request } from "express";
import { requireAuth } from "../middlewares/auth";
import { stripeRequest } from "../stripeClient";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const OFFER_KEY = "plano-premium-one-time-brl-1990";

async function findPremiumPrice() {
  const query = encodeURIComponent(
    `metadata['offer_key']:'${OFFER_KEY}' AND active:'true'`,
  );
  const products = await stripeRequest<{ data: Array<{ id: string }> }>(
    `/v1/products/search?query=${query}&limit=10`,
  );
  const product = products.data[0];
  if (!product) {
    throw new Error("Produto Plano Premium não encontrado na Stripe");
  }

  const prices = await stripeRequest<{
    data: Array<{ id: string; currency: string; unit_amount: number | null }>;
  }>(
    `/v1/prices?product=${encodeURIComponent(product.id)}&active=true&type=one_time&limit=100`,
  );
  const price = prices.data.find(
    (item) => item.currency === "brl" && item.unit_amount === 1990,
  );
  if (!price) {
    throw new Error("Preço de R$ 19,90 não encontrado para o Plano Premium");
  }

  return price;
}

async function findOrCreateCustomer(user: { id: number; email: string; name: string }) {
  const query = encodeURIComponent(`metadata['app_user_id']:'${user.id}'`);
  const existing = await stripeRequest<{ data: Array<{ id: string }> }>(
    `/v1/customers/search?query=${query}&limit=1`,
  );
  if (existing.data[0]) return existing.data[0];

  const body = new URLSearchParams({
    email: user.email,
    name: user.name,
    "metadata[app_user_id]": String(user.id),
    "metadata[app]": "vizinhanca-real",
  });
  return stripeRequest<{ id: string }>("/v1/customers", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
}

function getPublicBaseUrl(req: Request) {
  const configuredDomain = process.env.REPLIT_DOMAINS?.split(",")[0]?.trim();
  if (configuredDomain) return `https://${configuredDomain}`;
  const host = req.get("host");
  if (!host) throw new Error("Domínio público do aplicativo não disponível");
  return `${req.protocol}://${host}`;
}

router.post("/stripe/checkout", requireAuth, async (req, res): Promise<void> => {
  try {
    const user = req.currentUser!;
    const [price, customer] = await Promise.all([
      findPremiumPrice(),
      findOrCreateCustomer(user),
    ]);
    const baseUrl = getPublicBaseUrl(req);
    const body = new URLSearchParams({
      mode: "payment",
      customer: customer.id,
      client_reference_id: String(user.id),
      "line_items[0][price]": price.id,
      "line_items[0][quantity]": "1",
      allow_promotion_codes: "false",
      success_url: `${baseUrl}/api/stripe/checkout/result?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/api/stripe/checkout/result?status=cancelled`,
      "metadata[app_user_id]": String(user.id),
      "metadata[offer_key]": OFFER_KEY,
    });
    const session = await stripeRequest<{ url: string | null }>(
      "/v1/checkout/sessions",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      },
    );

    if (!session.url) {
      res.status(502).json({ error: "A Stripe não retornou a URL do checkout" });
      return;
    }
    res.json({ url: session.url });
  } catch (error) {
    logger.error({ err: error }, "Failed to create Stripe checkout");
    res.status(502).json({ error: "Não foi possível iniciar o pagamento" });
  }
});

router.get("/stripe/status", requireAuth, async (req, res): Promise<void> => {
  try {
    const user = req.currentUser!;
    const customer = await findOrCreateCustomer(user);
    const sessions = await stripeRequest<{
      data: Array<{
        status: string | null;
        payment_status: string;
        client_reference_id: string | null;
        metadata?: Record<string, string>;
      }>;
    }>(
      `/v1/checkout/sessions?customer=${encodeURIComponent(customer.id)}&limit=10`,
    );
    const session = sessions.data.find(
      (item) =>
        item.client_reference_id === String(user.id) &&
        item.metadata?.offer_key === OFFER_KEY,
    );

    res.json({
      status: session?.status ?? "none",
      paymentStatus: session?.payment_status ?? "unpaid",
      isPremium: session?.payment_status === "paid",
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to check Stripe payment status");
    res.status(502).json({ error: "Não foi possível verificar o pagamento" });
  }
});

router.get("/stripe/checkout/result", (req, res): void => {
  const paid = req.query.status === "success";
  const sessionId =
    typeof req.query.session_id === "string" ? req.query.session_id : "";
  const deepLink = `mobile:///planos?checkout=${paid ? "success" : "cancelled"}${sessionId ? `&session_id=${encodeURIComponent(sessionId)}` : ""}`;
  res
    .status(200)
    .type("html")
    .send(`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${paid ? "Pagamento concluído" : "Pagamento cancelado"}</title>
<style>body{margin:0;background:#F7F2EA;color:#2B2B28;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;text-align:center}.card{max-width:360px;padding:32px}h1{color:#1E4A4F}a{display:block;background:#1E4A4F;color:#fff;padding:14px 20px;border-radius:14px;text-decoration:none;font-weight:700;margin-top:24px}</style>
</head><body><main class="card"><h1>${paid ? "Pagamento concluído" : "Pagamento cancelado"}</h1>
<p>${paid ? "Seu pagamento foi recebido. Volte ao Vizinhança Real para confirmar o Plano Premium." : "Nenhuma cobrança foi realizada."}</p>
<a href="${deepLink}">Voltar ao aplicativo</a></main></body></html>`);
});

export default router;