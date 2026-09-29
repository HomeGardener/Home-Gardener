import sensoresRepository from '../repositories/sensores-repository.js';
import plantaService from './plantas-service.js';
import { validaciones } from '../utils/validaciones.js';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/AppError.js';

const repo = new sensoresRepository();
const repoPlantas = new plantaService();
const validator = new validaciones();

function validateOptionalDate(date, dateValidator) {
  if (date !== undefined && date !== null && !dateValidator.isValidDate(date)) {
    throw new AppError('Fecha inválida', StatusCodes.BAD_REQUEST);
  }
}

export default class SensoresService {
  constructor({ repository = repo, plantService = repoPlantas, validations = validator } = {}) {
    this.repository = repository;
    this.plantService = plantService;
    this.validations = validations;
  }

  async obtenerDatosSensores(idPlanta, idUsuario) {
    if (!this.validations.isEnteroPositivo(idPlanta)) {
      throw new AppError('idPlanta inválido', StatusCodes.BAD_REQUEST);
    }
    if (!(await this.plantService.validarPropietario(idPlanta, idUsuario))) {
      throw new AppError('No tienes permiso', StatusCodes.FORBIDDEN);
    }

    const datos = await this.repository.obtenerUltimoRegistroSensor(idPlanta);
    if (!datos) throw new AppError('No hay mediciones', StatusCodes.NOT_FOUND);
    return { status: StatusCodes.OK, data: datos };
  }

  async obtenerUltimoRiego(idPlanta, idUsuario) {
    if (!this.validations.isEnteroPositivo(idPlanta)) {
      throw new AppError('idPlanta inválido', StatusCodes.BAD_REQUEST);
    }
    if (!(await this.plantService.validarPropietario(idPlanta, idUsuario))) {
      throw new AppError('No tienes permiso', StatusCodes.FORBIDDEN);
    }

    const riego = await this.repository.obtenerUltimoRiego(idPlanta);
    if (!riego) throw new AppError('No hay registros de riego', StatusCodes.NOT_FOUND);
    return { status: StatusCodes.OK, data: riego };
  }

  async conectarModulo(idPlanta, idModulo, idUsuario) {
    if (!this.validations.isEnteroPositivo(idPlanta) || !this.validations.isEnteroPositivo(idModulo)) {
      throw new AppError('Parámetros inválidos', StatusCodes.BAD_REQUEST);
    }

    const modulo = await this.repository.conectarModulo(idModulo, idPlanta, idUsuario);
    return { status: StatusCodes.OK, data: { message: 'Módulo conectado exitosamente', id: modulo.ID } };
  }

  async desconectarModulo(idPlanta, idUsuario) {
    if (!this.validations.isEnteroPositivo(idPlanta)) {
      throw new AppError('idPlanta inválido', StatusCodes.BAD_REQUEST);
    }
    if (!(await this.plantService.validarPropietario(idPlanta, idUsuario))) {
      throw new AppError('No tienes permiso', StatusCodes.FORBIDDEN);
    }

    const modulos = await this.repository.obtenerModulosDePlanta(idPlanta);
    if (modulos.length === 0) throw new AppError('No hay módulo conectado', StatusCodes.NOT_FOUND);
    const result = await this.repository.desconectarModulo(idPlanta);
    return { status: StatusCodes.OK, data: { message: 'Módulo desconectado exitosamente', ids: result.map((row) => row.ID) } };
  }

  async subirDatosPlanta({ idPlanta, temperatura, humedad, fecha, idUsuario }) {
    if (!this.validations.isEnteroPositivo(idPlanta) ||
        !this.validations.isValidTemperature(temperatura) ||
        !this.validations.isValidHumidity(humedad)) {
      throw new AppError('Temperatura, humedad o identificador fuera de rango', StatusCodes.BAD_REQUEST);
    }
    validateOptionalDate(fecha, this.validations);
    if (!(await this.plantService.validarPropietario(idPlanta, idUsuario))) {
      throw new AppError('No tienes permiso', StatusCodes.FORBIDDEN);
    }

    const humedadInt = Math.round(humedad);
    const humedadAntes = await this.repository.obtenerUltimaHumedad(idPlanta);
    const registro = await this.repository.insertarDatosRegistrados(idPlanta, temperatura, humedadInt, fecha, humedadAntes);
    return { status: StatusCodes.CREATED, data: { message: 'Datos subidos correctamente', registro } };
  }

  async registrarUltimoRiego({ idPlanta, fecha, duracionRiego, idUsuario }) {
    if (!this.validations.isEnteroPositivo(idPlanta) || !this.validations.isPositivo(duracionRiego)) {
      throw new AppError('Identificador o duración de riego inválidos', StatusCodes.BAD_REQUEST);
    }
    validateOptionalDate(fecha, this.validations);
    if (!(await this.plantService.validarPropietario(idPlanta, idUsuario))) {
      throw new AppError('No tienes permiso', StatusCodes.FORBIDDEN);
    }

    const registro = await this.repository.insertarUltimoRiego(idPlanta, fecha, duracionRiego);
    return { status: StatusCodes.CREATED, data: { message: 'Riego registrado correctamente', registro } };
  }
}
