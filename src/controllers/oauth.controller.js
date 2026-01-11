import { randomBytes } from "crypto";
import { asyncHandler } from "#lib/async-handler";
import {
  getAuthorizationUrl,
  exchangeCodeForToken,
  getUserInfo,
  findOrCreateUser,
} from "#services/oauth.service";

export const redirectToGoogle = asyncHandler(async (req, res) => {
  const state = randomBytes(32).toString("hex");

  req.session.oauthState = state;

  const authUrl = getAuthorizationUrl(state);

  res.redirect(authUrl);
});

export const handleGoogleCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({
      success: false,
      message: "Paramètres manquants dans le callback",
    });
  }

  if (state !== req.session.oauthState) {
    return res.status(400).json({
      success: false,
      message: "État CSRF invalide",
    });
  }

  delete req.session.oauthState;

  const googleAccessToken = await exchangeCodeForToken(code);
  const googleUser = await getUserInfo(googleAccessToken);
  const user = await findOrCreateUser(googleUser);

  res.json({
    success: true,
    message: "Connexion OAuth réussie",
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    },
  });
});
