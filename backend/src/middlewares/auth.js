import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET no está configurado. La aplicación no puede funcionar de forma segura.');
  process.exit(1);
}

export default function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: 'Token de autorización requerido' 
      });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(StatusCodes.UNAUTHORIZED).json({ 
            success: false,
            message: 'Token expirado' 
          });
        }
        return res.status(StatusCodes.FORBIDDEN).json({ 
          success: false,
          message: 'Token inválido' 
        });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
}