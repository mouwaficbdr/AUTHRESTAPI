import { twoFactorController } from '#controllers/twoFactor.controller';
import { Router } from 'express';

const router = Router();

router.post('/activate', twoFactorController.activate);