import { Router } from "express";
import { UserController } from "#controllers/user.controller";
import { asyncHandler } from "#lib/async-handler";
import { authMiddleware } from "#middlewares/auth.middleware";
import { AuthController } from '../controllers/auth.controller.js';

const router = Router();

// Inscription et Connexion
router.post("/register", asyncHandler(UserController.register));
router.post("/login", asyncHandler(UserController.login));
router.post("/logout", asyncHandler(authMiddleware, UserController.logout));
router.post("/refresh", asyncHandler(UserController.refresh));
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Consultation de la liste ou d'un utilisateur
router.get("/", asyncHandler(UserController.getAll));
router.get("/:id", asyncHandler(UserController.getById));

export default router;
