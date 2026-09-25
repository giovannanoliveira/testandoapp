import express, { Router, type IRouter, type Request } from "express";
import type Stripe from "stripe";
import { and, eq, isNull } from "drizzle-orm";
import { db, usuariosTable, type Usuario } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { getStripe } from "../stripeClient";
import { logger } from "../lib/logger";

const router: IRouter = Router();
export const OFFER_KEY = "plano-premium-one-time-brl-1990";

async function findPremiumPrice() {
  const stripe = getStripe();
  const configuredPrice = process.env.STRIPE_PRICE_ID;
  if (configuredPrice) return stripe.prices.retrieve(configuredPrice);

  const products = await stripe.products.search({
    query: `metadata['offer_key']:'${OFFER_KEY}' AND active:'true'`,
    limit: 10,
  });
  const product = products.data[0];
  if (!product) {
    throw new Error(
      "Produto Plano Premium não encontrado na Stripe (rode pnpm --filter @workspace/scripts run seed:stripe)",
    );
  }

  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    type: "one_time",
    limit: 100,
  });
  const price = prices.data.find(
    (item) => item.currency === "brl" && item.unit_amount === 1990,
  );
  if (!price) {
    throw new Error("Preço de R$ 19,90 não encontrado para o Plano Premium");
  }

  return price;
}

async function findOrCreateCustomer(user: Usuario): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await getStripe().customers.create({
    email: user.email,
    name: user.name,
    metadata: { app_user_id: String(user.id), app: "vizinhanca-real" },
  });
  await db
    .update(usuariosTable)
    .set({ stripeCustomerId: customer.id })
    .where(eq(usuariosTable.id, user.id));
  return customer.id;
}

/**
 * Marks the user as Premium when the Checkout Session is a paid Premium
 * purchase. Safe to call repeatedly (webhook, return page and status check).
 */
async function activatePremiumFromSession(
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  if (session.payment_status !== "paid") return false;
  if (session.metadata?.offer_key !== OFFER_KEY) return false;
  const userId = Number(session.metadata?.app_user_id);
  if (!Number.isInteger(userId)) return false;

  await db
    .update(usuariosTable)
    .set({ premiumAt: new Date() })
    .where(and(eq(usuariosTable.id, userId), isNull(usuariosTable.premiumAt)));
  return true;
}

function getPublicApiUrl(req: Request) {
  const configured = process.env.PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  const host = req.get("host");
  if (!host) throw new Error("Domínio público da API não disponível");
  return `${req.protocol}://${host}`;
}

router.post("/stripe/checkout", requireAuth, async (req, res): Promise<void> => {
  try {
    const user = req.currentUser!;
    const [price, customerId] = await Promise.all([
      findPremiumPrice(),
      findOrCreateCustomer(user),
    ]);
    const baseUrl = getPublicApiUrl(req);
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      client_reference_id: String(user.id),
      line_items: [{ price: price.id, quantity: 1 }],
      allow_promotion_codes: false,
      success_url: `${baseUrl}/api/stripe/checkout/result?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/api/stripe/checkout/result?status=cancelled`,
      metadata: { app_user_id: String(user.id), offer_key: OFFER_KEY },
    });

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
  const user = req.currentUser!;
  if (user.premiumAt) {
    res.json({ status: "complete", paymentStatus: "paid", isPremium: true });
    return;
  }
  if (!user.stripeCustomerId) {
    res.json({ status: "none", paymentStatus: "unpaid", isPremium: false });
    return;
  }

  // Fallback for when the webhook has not been delivered yet.
  try {
    const sessions = await getStripe().checkout.sessions.list({
      customer: user.stripeCustomerId,
      limit: 10,
    });
    const premiumSessions = sessions.data.filter(
      (item) =>
        item.client_reference_id === String(user.id) &&
        item.metadata?.offer_key === OFFER_KEY,
    );
    const paid = premiumSessions.find((item) => item.payment_status === "paid");
    if (paid) await activatePremiumFromSession(paid);
    const session = paid ?? premiumSessions[0];

    res.json({
      status: session?.status ?? "none",
      paymentStatus: session?.payment_status ?? "unpaid",
      isPremium: Boolean(paid),
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to check Stripe payment status");
    res.status(502).json({ error: "Não foi possível verificar o pagamento" });
  }
});

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

router.get("/stripe/checkout/result", async (req, res): Promise<void> => {
  let paid = false;
  const sessionId =
    typeof req.query.session_id === "string" ? req.query.session_id : "";
  if (req.query.status === "success" && sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      paid = await activatePremiumFromSession(session);
    } catch (error) {
      logger.warn({ err: error }, "Failed to verify Stripe checkout session");
    }
  }

  const query = `checkout=${paid ? "success" : "cancelled"}`;
  const appUrl = process.env.APP_URL?.trim().replace(/\/+$/, "");
  const backLink = appUrl ? `${appUrl}/planos?${query}` : `mobile:///planos?${query}`;
  res
    .status(200)
    .type("html")
    .send(`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${paid ? "Pagamento concluído" : "Pagamento não concluído"}</title>
<style>body{margin:0;background:#F7F2EA;color:#2B2B28;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;text-align:center}.card{max-width:360px;padding:32px}h1{color:#1E4A4F}a{display:block;background:#1E4A4F;color:#fff;padding:14px 20px;border-radius:14px;text-decoration:none;font-weight:700;margin-top:24px}</style>
</head><body><main class="card"><h1>${paid ? "Pagamento concluído" : "Pagamento não concluído"}</h1>
<p>${paid ? "Seu pagamento foi recebido e o Plano Premium já está ativo." : "Nenhuma cobrança foi realizada."}</p>
<a href="${escapeHtml(backLink)}">Voltar ao aplicativo</a></main></body></html>`);
});

/**
 * Stripe webhook. Must receive the raw body, so it is mounted in app.ts before
 * express.json().
 */
export const stripeWebhookHandler = [
  express.raw({ type: "application/json" }),
  async (req: Request, res: express.Response): Promise<void> => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers["stripe-signature"];
    if (!secret || typeof signature !== "string") {
      res.status(400).json({ error: "Webhook da Stripe não configurado" });
      return;
    }

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(req.body, signature, secret);
    } catch (error) {
      logger.warn({ err: error }, "Invalid Stripe webhook signature");
      res.status(400).json({ error: "Assinatura inválida" });
      return;
    }

    try {
      if (
        event.type === "checkout.session.completed" ||
        event.type === "checkout.session.async_payment_succeeded"
      ) {
        await activatePremiumFromSession(event.data.object);
      }
      res.json({ received: true });
    } catch (error) {
      logger.error({ err: error }, "Failed to process Stripe webhook");
      res.status(500).json({ error: "Falha ao processar webhook" });
    }
  },
];

export default router;
