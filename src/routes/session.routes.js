import { Router } from 'express';
import { authMiddleware } from '#middlewares/auth.middleware';
import * as sessionController from '#controllers/session.controller';

const router = Router();

router.get('/', authMiddleware, sessionController.listActiveSessions);
router.delete('/:sessionId', authMiddleware, sessionController.revokeSession);
router.delete('/', authMiddleware, sessionController.revokeOtherSessions);

export default router;
