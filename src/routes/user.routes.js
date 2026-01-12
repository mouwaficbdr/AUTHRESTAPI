import { Router } from "express";
import { UserController } from "#controllers/user.controller";
import { asyncHandler } from "#lib/async-handler";
import { authMiddleware } from "#middlewares/auth.middleware";
import { forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import {Ratelimiter} from '../middlewares/rate-limiter.js'


const router = Router();

// Inscription et Connexion
router.post("/register", asyncHandler(UserController.register));
router.post("/login",Ratelimiter,asyncHandler(UserController.login));
router.post("/logout", authMiddleware, asyncHandler(UserController.logout));
router.post("/refresh", asyncHandler(UserController.refresh));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));

// Consultation de la liste ou d'un utilisateur
router.get("/", asyncHandler(UserController.getAll));
router.get("/:id", asyncHandler(UserController.getById));

// Gestion Profil

router.put('/updateInfos',authMiddleware,asyncHandler(UserController.updateProfile));
router.delete('/deleteAccount',authMiddleware,asyncHandler(UserController.deleteAccount));

export default router;
