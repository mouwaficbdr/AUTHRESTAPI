import { Router } from "express";
import { redirectToGoogle, handleGoogleCallback } from "#controllers/oauth.controller";

const router = Router();

router.get("/google", redirectToGoogle);

router.get("/google/callback", handleGoogleCallback);

export default router;
