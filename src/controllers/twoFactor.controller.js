import prisma from "#lib/prisma";
import { UserService } from "#services/user.service";
import { ForbiddenException, HttpException, ValidationException } from "#lib/exceptions";
import { signToken } from "#lib/jwt";
import { generateQRCode, generateSecret, verifyCode } from "#lib/authenticator";

export const twoFactorController = {
    async setup(req, res){
        const { email } = req.body;

        try{
            const user = await prisma.user.findUnique({
                where: { email: email }
            });

            if(!user) return res.status(401).json({
                code: 401,
                message: "Invalid credentials",
            });

            const userSecret = generateSecret();

            await prisma.user.update({
                where: { email: email },
                data: { twoFactorSecret: userSecret }
            });

            const qrCode = await generateQRCode(email, userSecret);

            res.status(200).json({
                code: 200,
                message: "QR Code envoyé et en attente de validation",
                qrCode
            })
        }catch(error){
            return res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    },

    async activate(req, res){
        const { token } = req.body;
        const id = req.user.id;

        if(token == undefined) throw new ValidationException();
        try{

            const user = UserService.findById(id);
        
            if(!verifyCode(token, user.TwoFASecret)) throw new ForbiddenException("Code invalide")
        
            await prisma.user.update({
                where: { id: id },
                data: { 
                    twoFactorEnableAt: Date.now(),
                    disabledAt: null
                }
            });
        
            // Maintenant là on doit générer les 10 recovery codes pour les cas de perte.
        
            const elevated_token = signToken({ id: id, twoFactorActivate}, '15m');

            return res.status(200).json({
                code: 200,
                message: "2FA Activated successfully",
                elevated_token
            })
            
        }catch(error){
            throw new HttpException(500, error.message);
        }
    },

    async disabled(req, res){
        const { token } = req.body;
        const id = req.user.userId;

        if(token == undefined) throw new ValidationException();
        try{
            const user = UserService.findById(id);
        
            if(!verifyCode(token, user.TwoFASecret)) throw new ForbiddenException("Code invalide")

            await prisma.user.update({
                where: { id: id },
                data: {
                    disabledAt: Date.now(),
                    twoFactorEnableAt: null
                }
            });

            res.status(200).json({
                code: 200,
                message: "Two factor authentication disabled"
            })
        }catch(error){
            throw new HttpException(500, error.message);
        }
    }
};