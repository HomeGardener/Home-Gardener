import AmbienteRepository from '../repositories/ambiente-repository.js';
import AppError from '../utils/AppError.js';
import { StatusCodes } from 'http-status-codes';
import { validaciones } from '../utils/validaciones.js';
const repo = new AmbienteRepository();
const validator = new validaciones();

export default class AmbienteService {
  async agregar({ nombre, idUsuario, temperatura }) {
    const cleanName = typeof nombre === 'string' ? nombre.trim() : '';
    const roomTemperature = temperatura === undefined || temperatura === '' ? null : Number(temperatura);
    if (!validator.isValidString(cleanName) || !idUsuario ||
        (roomTemperature !== null && !validator.isValidTemperature(roomTemperature)))
      throw new AppError('Valores de campos inválidos', StatusCodes.BAD_REQUEST);
    const ambiente = await repo.buscarAmbiente(cleanName, idUsuario);
    if(!ambiente){
      const result = await repo.create(cleanName, idUsuario, roomTemperature);
      return result;
    }else{
      throw new AppError('Ya tenes un ambiente con este nombre', StatusCodes.BAD_REQUEST);
    }
    
  }

  async listar(idUsuario) {
    return repo.getAllByUserId(idUsuario);
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
