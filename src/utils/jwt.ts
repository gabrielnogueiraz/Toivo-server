import { FastifyInstance } from 'fastify';

export async function generateTokens(app: FastifyInstance, userId: string) {
  const accessToken = app.jwt.sign(
    { id: userId },
    { expiresIn: '15m' }
  );

  const refreshToken = app.jwt.sign(
    { id: userId },
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

export async function verifyToken(app: FastifyInstance, token: string) {
  try {
    const decoded = app.jwt.verify<{ id: string }>(token);
    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, error };
  }
}
