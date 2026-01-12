import prisma from "#lib/prisma";
import { randomUUID } from 'node:crypto';
import { hashPassword, verifyPassword } from "#lib/password";
import { ConflictException, UnauthorizedException, NotFoundException, InternalServerException, ForbiddenException } from "#lib/exceptions";
import { signToken, verifyToken } from "#lib/jwt";

export class UserService {
  //Fonction d'inscription
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
              updatedAt: now,
              createdAt: now, 
              twoFactorSecret: "" 
            },
    });
  }

  //Fonction de connxion
  static async login(email, password, ipAddress, userAgent) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password || !(await verifyPassword(user.password, password))) {
      throw new UnauthorizedException("Identifiants invalides");
    }
    
        //Generation des tokens
      const accessToken = await signToken({ id: user.id, email: user.email }, '15m');
      const refreshToken = await signToken({ id: user.id }, '7d');
      
    //Stocker le refresh token dans la BDD
        await prisma.refreshToken.create({
          data: {
            id: randomUUID(),
            token: refreshToken,
            userId: user.id,
            ipAddress,
            userAgent,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        });

    //Stocker le succes dans LoginHistory
      await prisma.loginHistory.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        ipAddress,
        userAgent,
        success: true,
        createdAt: new Date()
      }
    });

    return { accessToken, 
             refreshToken, 
             user: { 
              id: user.id, 
              email: user.email 
            } 
          };

  }

  //Fonction de refresh token
  static async refresh(token, ipAddress, userAgent){

    //vérifier la validité du JWT
    const payload = await verifyToken(token);

    //Chercher le Token 
    const storedToken = await prisma.refreshToken.findFirst({
      where : {
        token : token,
        userId : payload.id,
        revokedAt : null
      }
    });

    if(!storedToken || storedToken.expiresAt < new Date()){
      throw new UnauthorizedException("Session expirée ou invalide");
    }

    const newAccessToken = await signToken({id: payload.id}, '15m');

    return {
      accessToken : newAccessToken
    }
  }
  
  //Fonction de deconnexion
  static async logout(userId, accessToken, refreshToken){

    // Invalider le Refresh Token dans la base
    await prisma.refreshToken.deleteMany({
      where: { userId: userId, token: refreshToken }
    });

  // Ajouter l'Access Token à la Blacklist
    const payload = await verifyToken(accessToken);
    
    await prisma.blacklistedAccessToken.create({
      data: {
        id: randomUUID(),
        token: accessToken,
        userId: userId,
        expiresAt: new Date(payload.exp * 1000) 
      }
    });
  }

static async resetPassword(token, newPassword) {
    // Trouver le token en base
    const resetEntry = await prisma.passwordResetToken.findFirst({
      where: { token },
      include: { user: true } 
    });

    // Vérifier s'il existe et s'il n'est pas expiré
    if (!resetEntry || resetEntry.expiresAt < new Date()) {
      throw new NotFoundException("Le lien de réinitialisation est invalide ou expiré.");
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await hashPassword(newPassword);

    //Mettre à jour le password ET supprimer le token utilisé
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetEntry.userId },
        data: { password: hashedPassword, updatedAt: new Date() }
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetEntry.id }
      })
    ]);
  }

  //Fonction de modification de mdp
  static async changePassword(userId, oldPassword, newPassword) {
    // Récupérer l'utilisateur 
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé");
    }

    // Vérifier que l'ancien mot de passe est correct
    const isMatch = await verifyPassword(user.password, oldPassword);
    if (!isMatch) {
      throw new UnauthorizedException("L'ancien mot de passe est incorrect");
    }

    // Hacher le nouveau mot de passe
    const hashedNewPassword = await hashPassword(newPassword);

    // Mettre à jour 
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    // Revoker l'utilisateur de tous ses autres appareils
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  static async findAll() {
    return await prisma.user.findMany();
  }

  static async findById(id) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé");
    }

    return user;
  }

  static async updateProfile(req){

    try{
      const userId = req.user.id;
      
      const {firstName,lastName} = req.body;

      if(!userId){
        throw new ForbiddenException();
      }

      const updatedUser = await prisma.user.update({
        where:{id:userId},
        data:{
          firstName,
          lastName
        }
      });

      return updatedUser;

    }catch(err){
      console.log(err);
      throw new InternalServerException();
    }
  }

  static async deleteAccount(req,res){
      try{

        if(!req.user.id){
          throw new ForbiddenException("Forbidden action to non authentified users ...");
        }

        const deletedUser = await prisma.user.delete({
          where:{id:req.user.id}
        });

        return deletedUser;

      }catch(err){
          console.log(err);
          return res.json({
            success:false,
            error:err
          })
      }
  }

}
