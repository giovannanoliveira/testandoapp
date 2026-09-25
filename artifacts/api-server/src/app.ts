import path from "node:path";
import { existsSync } from "node:fs";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import router from "./routes";
import { stripeWebhookHandler } from "./routes/stripe";
import { logger } from "./lib/logger";
import { isClerkConfigured } from "./middlewares/auth";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
app.use(cors({ credentials: true, origin: corsOrigin() }));
// Stripe needs the raw body to verify the signature, so this goes before express.json().
app.post("/api/stripe/webhook", ...stripeWebhookHandler);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (isClerkConfigured()) {
  app.use(
    clerkMiddleware((req) => ({
      publishableKey: publishableKeyFromHost(
        getClerkProxyHost(req) ?? "",
        process.env.CLERK_PUBLISHABLE_KEY,
      ),
    })),
  );
} else {
  logger.warn("CLERK_SECRET_KEY não configurada: login com Google desativado");
}

app.use("/api", router);

// Optionally serve the exported web app (pnpm --filter @workspace/mobile run build:web)
// from the same origin as the API.
const webDir = path.resolve(
  process.env.WEB_DIST_DIR ?? path.join(process.cwd(), "../mobile/dist"),
);
if (existsSync(path.join(webDir, "index.html"))) {
  app.use(express.static(webDir, { extensions: ["html"] }));
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(webDir, "index.html"));
  });
  logger.info({ webDir }, "Serving web app");
}

function corsOrigin(): boolean | string[] {
  const origins = process.env.CORS_ORIGINS?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return origins && origins.length > 0 ? origins : true;
}

export default app;
