import nodemailer from 'nodemailer';
import { logger } from '#lib/logger';

// Configuration du transporteur Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || 'send.mailtrap.io',
  port: process.env.MAILTRAP_PORT || 587,
  secure: false, // true pour 465, false pour 587
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// Vérifier la connexion au démarrage
transporter.verify((error, success) => {
  if (error) {
    logger.error('Mailtrap connection error:', error);
  } else {
    logger.info('Mailtrap ready for message');
  }
});

/**
 * Template pour l'email de réinitialisation de mot de passe
 */
function getForgotPasswordTemplate(resetLink, userName) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 40px 30px;
          color: #333;
        }
        .content h2 {
          color: #667eea;
          margin-top: 0;
        }
        .content p {
          line-height: 1.6;
          margin: 15px 0;
          color: #666;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          padding: 12px 30px;
          border-radius: 5px;
          text-decoration: none;
          margin: 20px 0;
          font-weight: bold;
          transition: transform 0.2s;
        }
        .cta-button:hover {
          transform: scale(1.05);
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          color: #856404;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          color: #999;
          font-size: 12px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Réinitialisation de mot de passe</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${userName || 'Utilisateur'},</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe.</p>
          
          <a href="${resetLink}" class="cta-button">Réinitialiser mon mot de passe</a>
          
          <p>Ou copiez ce lien dans votre navigateur:</p>
          <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
            ${resetLink}
          </p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> Ce lien n'est valide que pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </div>
          
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        </div>
        <div class="footer">
          <p>© 2026 AuthRestAPI. Tous droits réservés.</p>
          <p>Cet email a été envoyé à votre adresse email enregistrée.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template pour la confirmation de réinitialisation de mot de passe
 */
function getResetPasswordConfirmationTemplate(userName) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 40px 30px;
          color: #333;
        }
        .content h2 {
          color: #667eea;
          margin-top: 0;
        }
        .content p {
          line-height: 1.6;
          margin: 15px 0;
          color: #666;
        }
        .success-box {
          background-color: #d4edda;
          border-left: 4px solid #28a745;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          color: #155724;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          color: #999;
          font-size: 12px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Mot de passe réinitialisé</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${userName || 'Utilisateur'},</h2>
          <p>Votre mot de passe a été réinitialisé avec succès!</p>
          
          <div class="success-box">
            <strong>✓ Succès:</strong> Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </div>
          
          <p>Si vous n'avez pas effectué cette action, veuillez immédiatement <strong>sécuriser votre compte</strong> en accédant à vos paramètres de sécurité.</p>
          
          <p>Pour votre sécurité, nous recommandons de:</p>
          <ul>
            <li>Utiliser un mot de passe fort et unique</li>
            <li>Activer l'authentification à deux facteurs</li>
            <li>Vérifier vos activités récentes</li>
          </ul>
        </div>
        <div class="footer">
          <p>© 2026 AuthRestAPI. Tous droits réservés.</p>
          <p>Cet email a été envoyé à votre adresse email enregistrée.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export class EmailService {
  /**
   * Envoyer l'email de réinitialisation de mot de passe
   */
  static async sendPasswordResetEmail(email, resetToken, userName) {
    try {
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.MAILTRAP_FROM || 'noreply@authrestapi.com',
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        html: getForgotPasswordTemplate(resetLink, userName),
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email de réinitialisation envoyé à ${email}`, { messageId: info.messageId });
      return true;
    } catch (error) {
      logger.error(`Erreur lors de l'envoi de l'email de réinitialisation à ${email}:`, error);
      throw error;
    }
  }

  /**
   * Envoyer l'email de confirmation de réinitialisation
   */
  static async sendPasswordResetConfirmation(email, userName) {
    try {
      const mailOptions = {
        from: process.env.MAILTRAP_FROM || 'noreply@authrestapi.com',
        to: email,
        subject: 'Votre mot de passe a été réinitialisé',
        html: getResetPasswordConfirmationTemplate(userName),
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email de confirmation de réinitialisation envoyé à ${email}`, { messageId: info.messageId });
      return true;
    } catch (error) {
      logger.error(`Erreur lors de l'envoi de l'email de confirmation à ${email}:`, error);
      throw error;
    }
  }

  /**
   * Tester la connexion à Mailtrap
   */
  static async testConnection() {
    try {
      await transporter.verify();
      return { success: true, message: 'Connexion à Mailtrap réussie' };
    } catch (error) {
      logger.error('Erreur de connexion à Mailtrap:', error);
      return { success: false, message: error.message };
    }
  }
}
