import axios from "axios";
import { randomUUID } from "crypto";
import prisma from "#lib/prisma";
import { BadRequestException } from "#lib/exceptions";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export function getAuthorizationUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  try {
    const response = await axios.post(
      GOOGLE_TOKEN_URL,
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Erreur lors de l'échange du code:", error.response?.data || error.message);
    throw new BadRequestException("Échec de l'échange du code d'autorisation");
  }
}

export async function getUserInfo(accessToken) {
  try {
    const response = await axios.get(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des infos utilisateur:", error.message);
    throw new BadRequestException("Échec de la récupération des informations utilisateur");
  }
}

export async function findOrCreateUser(googleUser) {
  const { id: googleId, email, name } = googleUser;

  const existingOAuthAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerId: {
        provider: "google",
        providerId: googleId,
      },
    },
    include: { user: true },
  });

  if (existingOAuthAccount) {
    return existingOAuthAccount.user;
  }

  // Vérifier si un utilisateur avec cet email existe déjà
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Créer un nouvel utilisateur
    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ") || firstName;

    user = await prisma.user.create({
      data: {
        id: randomUUID(),
        email,
        firstName,
        lastName,
        password: null,
        emailVerifiedAt: new Date(), 
        twoFactorSecret: "", 
        updatedAt: new Date(),
      },
    });
  }

  // Lier le compte OAuth à l'utilisateur
  await prisma.oAuthAccount.create({
    data: {
      id: randomUUID(),
      provider: "google",
      providerId: googleId,
      userId: user.id,
      createdAt: new Date(),
    },
  });

  return user;
}
