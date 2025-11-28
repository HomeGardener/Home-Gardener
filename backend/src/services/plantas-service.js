import plantaRepository from '../repositories/plantas-repository.js';
import { validaciones } from '../utils/validaciones.js';
import { StatusCodes } from 'http-status-codes';

const plantaRepo = new plantaRepository();
const validator = new validaciones(); 

export default class  plantaService {
  async agregarPlanta({ nombre, tipo, idAmbiente, idUsuario }) {
    if (!nombre || typeof nombre !== 'string' ||
        !tipo || typeof tipo !== 'string' ||
        !validator.isEnteroPositivo(idAmbiente)) {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'Datos inválidos' };
    }

    const tipoOk = await plantaRepo.verificarTipo(tipo.trim());
    if (tipoOk.length === 0) {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'Tipo de planta no válido' };
    }

    const ambienteOk = await plantaRepo.verificarAmbiente(idAmbiente, idUsuario);
    if (ambienteOk.length === 0) {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'Ambiente no encontrado o no tienes permisos' };
    }

    const planta = await plantaRepo.insertarPlanta(nombre.trim(), tipo.trim(), idAmbiente);
    return { error: false, status: StatusCodes.CREATED, data: planta };
  }

  async eliminarPlanta({ idPlanta, idUsuario }) {
    if (!validator.isEnteroPositivo(idPlanta)) {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'ID inválido' };
    }

    const existe = await plantaRepo.verificarExistencia(idPlanta, idUsuario);
    if (existe.length === 0) {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'Planta no encontrada o sin permiso' };
    }

    const tieneModulo = await plantaRepo.verificarModulo(idPlanta);
    if (tieneModulo.length > 0) {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'La planta tiene un módulo conectado' };
    }

    await plantaRepo.eliminarPlanta(idPlanta);
    return { error: false, status: StatusCodes.OK };
  }

  async actualizarFoto ({ foto, idPlanta, idUsuario }) {
    if (!foto || !validator.isEnteroPositivo(idPlanta)) {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'Datos inválidos' };
    }

    const permiso = await plantaRepo.verificarExistencia(idPlanta, idUsuario);
    if (permiso.length === 0) {
      return { error: true, status: StatusCodes.FORBIDDEN, message: 'Sin permiso para actualizar esta planta' };
    }

    const updated = await plantaRepo.actualizarFoto(foto.trim(), idPlanta);
    return { error: false, status: StatusCodes.OK, data: updated };
  }

  async listarPlantas (idUsuario) {
    const plantas = await plantaRepo.listarPlantas(idUsuario);
    if (plantas.length === 0) {
      return { error: true, status: StatusCodes.NOT_FOUND, message: 'No tienes plantas asociadas' };
    }
    return { error: false, status: StatusCodes.OK, data: plantas };
  }

  async validarPropietario({idPlanta, idUsuario}){
    const esPropietario = await plantaRepo.validarPropietario(idPlanta, idUsuario);
    return esPropietario;
  }


  async modificarNombre ({ idPlanta, nuevoNombre, idUsuario }){
    if (!validator.isEnteroPositivo(idPlanta) || !nuevoNombre || typeof nuevoNombre !== 'string') {
      return { error: true, status: StatusCodes.BAD_REQUEST, message: 'Datos inválidos' };
    }

    const permiso = await plantaRepo.verificarExistencia(idPlanta, idUsuario);
    if (permiso.length === 0) {
      return { error: true, status: StatusCodes.FORBIDDEN, message: 'Sin permiso para modificar esta planta' };
    }

    await plantaRepo.modificarNombre(nuevoNombre.trim(), idPlanta);
    return { error: false, status: StatusCodes.OK };
  }
};

