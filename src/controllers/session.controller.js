import { asyncHandler } from '#lib/async-handler';
import * as sessionService from '#services/session.service';
import { BadRequestException } from '#lib/exceptions';
import prisma from '#lib/prisma';

export const listActiveSessions = asyncHandler(async (req, res) => {
  const sessions = await sessionService.getActiveSessions(req.user.id);
  res.status(200).json(sessions);
});

export const revokeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    throw new BadRequestException('sessionId requis');
  }

  const result = await sessionService.revokeSession(req.user.id, sessionId);

  if (!result) {
    throw new BadRequestException('Session non trouvée ou non autorisé');
  }

  res.status(204).send();
});

export const revokeOtherSessions = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new BadRequestException('refreshToken requis');
  }

  const currentSession = await prisma.refreshToken.findFirst({
    where: {
      token: refreshToken,
      userId: req.user.id,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!currentSession) {
    throw new BadRequestException(
      'Token de rafraîchissement invalide ou expiré'
    );
  }

  await sessionService.revokeOtherSessions(req.user.id, currentSession.id);

  res.status(204).send();
});
