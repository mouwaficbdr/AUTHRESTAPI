import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit faire 8 caractères minimum"),
});