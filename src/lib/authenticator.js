import { generateSecret, verify, generateURI } from 'otplib';

export const generatedSecret = async () => {
    return generateSecret();
}

export const verifyCode = (token, secret) => {
    return verify({ token: token, secret: secret });
}

export const generateQRCode = async (email, secret) => {
    const uri = generateURI({
        issuer: 'ACTIVATION_2FA',
        label: email, 
        secret
    });

  return await qrcode.toDataURL(uri);
};
