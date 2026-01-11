import express from "express";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { transporter } from "../lib/mailer.js";

const router = express.Router();


// POST /auth/register

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  

  try {
    // Vérifie si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Génération du token pour l'email
    const emailToken = crypto.randomBytes(32).toString("hex");

    // Création de l'utilisateur en base
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        emailToken,
        emailVerified: false
      }
    });

    // URL de vérification
    const verificationUrl = `http://localhost:3000/auth/verify-email?token=${emailToken}`;

    // Envoi du mail de vérification
    await transporter.sendMail({
      from: `"Mon App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Vérifie ton email",
      html: `<p>Bonjour !</p>
             <p>Merci de t'être inscrit. Clique sur ce lien pour vérifier ton email :</p>
             <a href="${verificationUrl}">${verificationUrl}</a>`
    });

    console.log("Email de vérification envoyé à :", email);

    res.status(201).json({ message: "Utilisateur créé. Vérifie ton email !" });

  } catch (err) {
    console.error(" ERREUR REGISTER :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// GET /auth/verify-email


router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token manquant" });
    }

    const user = await prisma.user.findFirst({ where: { emailToken: token } });

    if (!user) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailToken: null
      }
    });

    res.json({ message: "Email vérifié avec succès" });

  } catch (error) {
    console.error(" ERREUR VERIFY EMAIL :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
  }); 
  
// POST /auth/resend-verification

router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email déjà vérifié" });
    }

    // Nouveau token
    const emailToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { emailToken }
    });

    const verificationUrl =
  `${process.env.APP_URL}/auth/verify-email?token=${emailToken}`;


    await transporter.sendMail({
      from: `"Mon App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Nouveau lien de vérification",
      html: `
        <p>Voici ton nouveau lien de vérification :</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `
    });

    res.json({ message: "Email de vérification renvoyé" });

  } catch (error) {
    console.error("RESEND ERROR:", error);
    res.status(500).json({ message: "Erreur serveur" });
  } 
});



export default router;
