import { twoFactorController } from '#controllers/twoFactor.controller';
import { Router } from 'express';

const router = Router();

router.get("/setup", twoFactorController.setup);
router.post("/activate", twoFactorController.activate);
router.post("/disabled", twoFactorController.disabled);


export default router;