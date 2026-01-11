import prisma from '#lib/prisma';

export async function getActiveSessions(userId) {
  return prisma.refreshToken.findMany({
    where: {
      userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      userAgent: true,
      ipAddress: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function revokeSession(userId, sessionId) {
  const session = await prisma.refreshToken.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== userId) {
    return null;
  }

  return prisma.refreshToken.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });
}

export async function revokeOtherSessions(userId, currentSessionId) {
  return prisma.refreshToken.updateMany({
    where: {
      userId,
      id: { not: currentSessionId },
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}
