import { randomBytes, randomUUID } from 'node:crypto';
import prisma from '#lib/prisma';

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
    console.log(`Lien de réinitialisation : http://frontend.com/reset-password?token=${resetToken}`);
  }
}