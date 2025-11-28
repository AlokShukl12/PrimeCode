import jwt from 'jsonwebtoken'

const tokenTtl = process.env.JWT_TTL || '2h'

export const generateToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: tokenTtl })
