import { SignJWT, jwtVerify } from "jose";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET environment variable is required");
}

const encodedSecret = new TextEncoder().encode(secret);
const alg = "HS256";

export async function signToken(payload, expiresIn = "7d" ) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encodedSecret);
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, encodedSecret);
  return payload;
}