import { twoFactorController } from '#controllers/twoFactor.controller';
import { Router } from 'express';

const router = Router();

router.get("/setup", twoFactorController.setup);
router.post("/activate", twoFactorController.activate);