// import { ForbiddenException } from "#lib/exceptions";
// import prisma from "#lib/prisma";

// const verify2FA = async (req, res, next) => {
//     const id = req.user.id;

//     const user2FA = await prisma.user.findUnique({
//         where: { id: id },
//         select: { twoFactorEnableAt: true }
//     });

//     if(!user2FA) throw ForbiddenException("Twof factor Authentication not enabled");

//     next();
// }