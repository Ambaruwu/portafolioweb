import { SignJWT, jwtVerify } from 'jose'

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET no está configurado')
  }

  return new TextEncoder().encode(secret)
}

export async function createSessionToken() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret())
}

export async function verifySessionToken(token: string) {
  try {
    await jwtVerify(token, getJwtSecret())
    return true
  } catch {
    return false
  }
}

export const ADMIN_SESSION_MAX_AGE = SESSION_TTL_SECONDS
