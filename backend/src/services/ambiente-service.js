import AmbienteRepository from '../repositories/ambiente-repository.js';
import AmbienteRepository from '../repositories/ambiente-repository.js';
import AppError from '../utils/AppError.js';
import { StatusCodes } from 'http-status-codes';
import { validaciones } from '../utils/validaciones.js';
const repo = new AmbienteRepository();
const validator = new validaciones();

export default class AmbienteService {
  async agregar({ nombre, idUsuario }) {
    if (!(await validator.isValidString(nombre)) || !idUsuario)
      throw new AppError('Valores de campos inválidos', StatusCodes.BAD_REQUEST);
    }

    const ambiente = await repo.buscarAmbiente(nombre, idUsuario);
    if(!ambiente){
      const result = await repo.create(nombre.trim(), idUsuario);
      return result;
    }else{
      throw new AppError('Ya tenes un ambiente con este nombre', StatusCodes.BAD_REQUEST);
    }
    
  }

  async listar(idUsuario) {
    const ambientes = await repo.getAllByUserId(idUsuario);
    if (ambientes.length === 0)
      throw new AppError('No se encontraron ambientes para este usuario', StatusCodes.NOT_FOUND);

    return ambientes;
  }

  async editar(id, { nombre, idUsuario }) {
    if (!validator.isValidString(nombre))
      throw new AppError('El nombre del ambiente es obligatorio y debe ser válido', StatusCodes.BAD_REQUEST);

    const ambiente = await repo.findById(id);
    if (!ambiente)
      throw new AppError('Ambiente no encontrado', StatusCodes.NOT_FOUND);

    if (ambiente.IdUsuario !== idUsuario)
      throw new AppError('No tienes permiso para editar este ambiente', StatusCodes.FORBIDDEN);

    const updated = await repo.updateNombre(id, nombre.trim());
    return updated;
  }
}
