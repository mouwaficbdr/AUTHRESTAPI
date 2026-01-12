import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

// Validation des variables d'environnement critiques
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required');
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

import { logger, httpLogger } from '#lib/logger';
import { errorHandler } from '#middlewares/error-handler';
import { notFoundHandler } from '#middlewares/not-found';
import userRouter from '#routes/user.routes';
import oauthRouter from '#routes/oauth.routes';
import twoFactorRouter from '#routes/twoFactor.routes';
import sessionRouter from '#routes/session.routes';
import { authMiddleware } from '#middlewares/auth.middleware';

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
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 10 * 60 * 1000, // 10 minutes
      sameSite: 'lax', // Permet les redirections cross-site depuis OAuth providers
    },
  })
);

// Routes
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API Express opérationnelle' });
});

// Utilisation des routes

app.use('/users', userRouter);
app.use('/', userRouter); // Pour garder /register et /login à la racine
app.use('/auth/two-factor-auth', twoFactorRouter);
app.use('/auth/oauth', oauthRouter); // Routes OAuth
app.use('/sessions', sessionRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Serveur démarré sur http://localhost:${PORT}`);
});

export default app;
