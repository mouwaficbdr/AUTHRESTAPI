import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string()
             .min(8, "Minimum 8 caractères")
             .regex(/[A-Z]/, 'Doit contenir des lettre en majuscules')
             .regex(/[0-9]/, 'Doit contenir des nombres'),
  firstName: z.string().min(3).optional(),
  lastName: z.string().min(3).optional(), 
  
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

