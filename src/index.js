import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

import { logger, httpLogger } from "#lib/logger";
import { errorHandler } from "#middlewares/error-handler";
import { notFoundHandler } from "#middlewares/not-found";
import userRouter from "#routes/user.routes";
import oauthRouter from "#routes/oauth.routes";
import twoFactorRouter from "#routes/twoFactor.routes";
import { authMiddleware } from "#middlewares/auth.middleware";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(httpLogger);
app.use(express.json());

// Configuration de la session pour OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || "changeme",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 10 * 60 * 1000, // 10 minutes
    },
  })
);

// Routes
app.get("/", (req, res) => {
  res.json({ success: true, message: "API Express opérationnelle" });
});

// Utilisation des routes

app.use("/users", userRouter);
app.use("/", userRouter); // Pour garder /register et /login à la racine
app.use("/auth/two-factor-auth", authMiddleware, twoFactorRouter);
app.use("/auth/oauth", oauthRouter); // Routes OAuth

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Serveur démarré sur http://localhost:${PORT}`);
});

export default app;