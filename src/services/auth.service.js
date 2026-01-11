import { randomBytes, randomUUID } from 'node:crypto';
import prisma from '#lib/prisma';
import { hashPassword } from '#lib/password';
import { NotFoundException } from '#lib/exceptions';
import { logger } from '#lib/logger';

export class AuthService {
  static async requestPasswordReset(email) {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return; 
    }

    // Générer un token aléatoire (sécurisé)
    const resetToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // Valide 1 heure

    // Enregistrer dans PasswordResetToken (en supprimant les anciens tokens s'il y en a)
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    
    await prisma.passwordResetToken.create({
      data: {
        id: randomUUID(),
        token: resetToken,
        userId: user.id,
        expiresAt,
        createdAt: new Date()
      }
    });

    // Envoyer l'e-mail 
    logger.info(`Lien de réinitialisation : http://frontend.com/reset-password?token=${resetToken}`);
  }

  static async resetPassword(token, newPassword) {
    // Trouver le token en base
    const resetEntry = await prisma.passwordResetToken.findFirst({
      where: { token },
      include: { user: true }
    });

    // Vérifier s'il existe et s'il n'est pas expiré
    if (!resetEntry || resetEntry.expiresAt < new Date()) {
      throw new NotFoundException("Le lien de réinitialisation est invalide ou expiré.");
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await hashPassword(newPassword);

    // Mettre à jour le password ET supprimer le token utilisé
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetEntry.userId },
        data: { password: hashedPassword, updatedAt: new Date() }
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetEntry.id }
      })
    ]);
  }
}