import { AuthService } from "#services/auth.service";

export class AuthController {
  
  // Demande de réinitialisation
  static async forgotPassword(req, res) {
    const { email } = validateData(forgotPasswordSchema, req.body);

    await AuthService.requestPasswordReset(email);

    // On renvoie toujours un succès pour ne pas révéler si l'email existe (Sécurité)
    res.json({
      success: true,
      message: "Si cet email existe, un lien de réinitialisation a été envoyé."
    });
  }

  // Action de réinitialisation avec le token
  static async resetPassword(req, res) {
    const { token, newPassword } = validateData(resetPasswordSchema, req.body);

    await AuthService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: "Votre mot de passe a été réinitialisé avec succès."
    });
  }
}