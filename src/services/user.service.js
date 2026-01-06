import prisma from "#lib/prisma";
import { randomUUID } from 'node:crypto';
import { hashPassword, verifyPassword } from "#lib/password";
import { ConflictException, UnauthorizedException, NotFoundException } from "#lib/exceptions";

export class UserService {
  static async register(data) {
    const { email, password, firstName, lastName } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException("Email déjà utilisé");
    }
    const Id = randomUUID();
    const hashedPassword = await hashPassword(password);
    const now = new Date();

    return prisma.user.create({
      data: { id:Id ,
              email, 
              password: hashedPassword, 
              firstName, 
              lastName, 
              createdAt: now, 
              twoFactorSecret: "" 
            },
    });
  }

  static async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(user.password, password))) {
      throw new UnauthorizedException("Identifiants invalides");
    }
    
    return user;
  }

  static async findAll() {
    return prisma.user.findMany();
  }

  static async findById(id) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé");
    }

    return user;
  }
}
