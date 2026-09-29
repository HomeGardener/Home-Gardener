import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está configurado');
}

export default function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Token de autorización requerido',
    });
  }

  try {
    req.user = jwt.verify(match[1], JWT_SECRET, { algorithms: ['HS256'] });
    return next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
    return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message });
  }
}
