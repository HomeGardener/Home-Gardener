import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/user-repository.js';
import { validaciones } from '../utils/validaciones.js';
import AppError from '../utils/AppError.js';
import { StatusCodes } from 'http-status-codes';
import StorageService from './storage-service.js';

const validator = new validaciones();
const userRepo = new UserRepository();
const storageServ = new StorageService();

function requireJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado');
  }
  return process.env.JWT_SECRET;
}

function publicUser(user) {
  if (!user) return user;
  return {
    ID: user.ID,
    Nombre: user.Nombre,
    Email: user.Email,
    Direccion: user.Direccion,
    Foto: user.Foto ?? null,
  };
}

function createToken(user) {
  return jwt.sign({ ID: user.ID }, requireJwtSecret(), {
    expiresIn: '1d',
    algorithm: 'HS256',
  });
}

export default class AuthService {
  async register({ nombre = '', email, password, direccion }, imageFile) {
    const cleanName = typeof nombre === 'string' ? nombre.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanAddress = typeof direccion === 'string' ? direccion.trim() : '';

    if ((cleanName && !validator.isValidString(cleanName)) ||
        !validator.isValidEmail(cleanEmail) ||
        !validator.isValidPassword(password) ||
        !validator.isValidString(cleanAddress)) {
      throw new AppError('Formato de campos inválido', StatusCodes.BAD_REQUEST);
    }

    if (await userRepo.emailExists(cleanEmail)) {
      throw new AppError('El email ya está registrado', StatusCodes.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let user;
    try {
      user = await userRepo.create(cleanName, cleanEmail, hashedPassword, cleanAddress, null);
    } catch (error) {
      if (error.code === '23505') {
        throw new AppError('El email ya está registrado', StatusCodes.CONFLICT);
      }
      throw error;
    }

    try {
      if (imageFile) {
        const foto = await storageServ.uploadFile(imageFile, 'perfil', user.ID);
        user = await userRepo.update(user.ID, { Foto: foto });
      }
      return { user: publicUser(user), token: createToken(user) };
    } catch (error) {
      await userRepo.deleteById(user.ID).catch(() => {});
      throw error;
    }
  }

  async login({ email, password }) {
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!validator.isValidEmail(cleanEmail) || typeof password !== 'string' || password.length === 0) {
      throw new AppError('Formato de campos inválido', StatusCodes.BAD_REQUEST);
    }

    const user = await userRepo.findByEmail(cleanEmail);
    if (!user || !(await bcrypt.compare(password, user.Password))) {
      throw new AppError('Credenciales inválidas', StatusCodes.UNAUTHORIZED);
    }

    return { user: publicUser(user), token: createToken(user) };
  }

  async getProfile(id) {
    const user = await userRepo.findById(id);
    if (!user) throw new AppError('Usuario no encontrado', StatusCodes.NOT_FOUND);
    return publicUser(user);
  }

  async updateProfile(id, { nombre, email, password, direccion }, imageFile) {
    const updateFields = {};

    if (email !== undefined) {
      const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      if (!validator.isValidEmail(cleanEmail)) {
        throw new AppError('Formato de email inválido', StatusCodes.BAD_REQUEST);
      }
      updateFields.Email = cleanEmail;
    }

    if (password !== undefined) {
      if (!validator.isValidPassword(password)) {
        throw new AppError('Contraseña inválida', StatusCodes.BAD_REQUEST);
      }
      updateFields.Password = await bcrypt.hash(password, 10);
    }

    if (nombre !== undefined) {
      if (!validator.isValidString(nombre)) {
        throw new AppError('El nombre debe tener al menos 3 caracteres', StatusCodes.BAD_REQUEST);
      }
      updateFields.Nombre = nombre.trim();
    }

    if (direccion !== undefined) {
      if (!validator.isValidString(direccion)) {
        throw new AppError('La dirección debe tener al menos 3 caracteres', StatusCodes.BAD_REQUEST);
      }
      updateFields.Direccion = direccion.trim();
    }

    if (imageFile) {
      updateFields.Foto = await storageServ.uploadFile(imageFile, 'perfil', id);
    }

    if (Object.keys(updateFields).length === 0) {
      throw new AppError('No hay campos para actualizar', StatusCodes.BAD_REQUEST);
    }

    try {
      const updated = await userRepo.update(id, updateFields);
      if (!updated) throw new AppError('Usuario no encontrado', StatusCodes.NOT_FOUND);
      return publicUser(updated);
    } catch (error) {
      if (error.code === '23505') {
        throw new AppError('El email ya está registrado', StatusCodes.CONFLICT);
      }
      throw error;
    }
  }
}
