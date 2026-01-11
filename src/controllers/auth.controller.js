import { AuthService } from "#services/auth.service";
import { validateData } from "#lib/validate";
import { forgotPasswordSchema, resetPasswordSchema } from "#schemas/auth.schema";

// Demande de réinitialisation
export async function forgotPassword(req, res) {
  const { email } = validateData(forgotPasswordSchema, req.body);

  await AuthService.requestPasswordReset(email);

  // On renvoie toujours un succès pour ne pas révéler si l'email existe (Sécurité)
  res.json({
    success: true,
    message: "Si cet email existe, un lien de réinitialisation a été envoyé."
  });
}

// Action de réinitialisation avec le token
export async function resetPassword(req, res) {
  const { token, newPassword } = validateData(resetPasswordSchema, req.body);

  await AuthService.resetPassword(token, newPassword);

  res.json({
    success: true,
    message: "Votre mot de passe a été réinitialisé avec succès."
  });
}