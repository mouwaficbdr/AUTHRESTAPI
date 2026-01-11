import prisma from "#lib/prisma";
import jwt from 'jsonwebtoken';

export const twoFactorController = {
    async activate(req, res){
        const { token } = req.body;
        const id = req.user.id;

        // Verifier si le token est vide d'abord (ne devrions nous pas le mettre dans un middleware ?)
        try{
            const user = await prisma.user.findUnique({
                where: {
                    id: id
                }
            });
        
            if(!user) return res.status(401).json({
                code: 401,
                message: "Invalid credentials"
            });
        
            if(!verifyCode(token, user.TwoFASecret)) return res.status(403).json({
                code: 403,
                message: "User unrecognized"
            });
        
            await prisma.user.update({
                where: { id: id },
                data: { twoFactorEnableAt: Date.now() }
            });
        
            // Maintenant là on doit générer les 10 recovery codes pour les cas de perte.
        
            const elevated_token = jwt.sign({ userId: id, TwoFAActivate: true }, process.env.SECRET_APP_KEY, { expiresIn: '15m' }); // Tu te demandes l'intérêt du 15min si c'est demandé every time

            return res.status(200).json({
                code: 200,
                message: "2FA Activated successfully",
                elevated_token
            })
            
        }catch(error){
            return res.status(500).json({
                code: 500,
                message: error.name
            });
        }
    }
};