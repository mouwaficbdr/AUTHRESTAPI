import { verifyToken } from '#lib/jwt';
import prisma from '#lib/prisma';
import { UnauthorizedException } from '#lib/exceptions';

export const authMiddleware = async (req, res, next) => {
  try {
    // Récupérer le token du header (Format: Bearer <token>)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException("Token manquant ou format invalide");
    }

    const token = authHeader.split(' ')[1];

    //  Vérifier si le token est dans la Blacklist (BDD)
    const isBlacklisted = await prisma.blacklistedAccessToken.findFirst({
      where: { token: token }
    });

    if (isBlacklisted) {
      throw new UnauthorizedException("Session expirée (déconnectée). Veuillez vous reconnecter.");
    }

    //  Vérifier la signature et l'expiration du JWT via ton fichier lib/jwt.js
    const payload = await verifyToken(token);

    //  On attache les infos de l'utilisateur à l'objet 'req'
    // Pour que les routes suivantes puissent savoir qui est connecté
    req.user = payload;

    next(); // On passe à la suite (le contrôleur)
  } catch (error) {
    // Si le token est expiré ou invalide, verifyToken lancera une erreur
    next(new UnauthorizedException(error.message || "Non autorisé"));
  }
};