import assert from 'node:assert/strict';
import test from 'node:test';
import SensoresService from '../src/services/sensores-service.js';

test('pasa el usuario autenticado al enlace atómico del módulo', async () => {
  let args;
  const service = new SensoresService({
    repository: {
      conectarModulo: async (...values) => {
        args = values;
        return { ID: 7 };
      },
    },
  });

  const result = await service.conectarModulo(3, 7, 'user-uuid');
  assert.deepEqual(args, [7, 3, 'user-uuid']);
  assert.equal(result.data.id, 7);
});

test('rechaza lecturas absurdas antes de consultar o escribir en la base', async () => {
  let ownerLookups = 0;
  const service = new SensoresService({
    repository: {
      obtenerUltimaHumedad: async () => 40,
      insertarDatosRegistrados: async () => assert.fail('No debe guardar datos inválidos'),
    },
    plantService: {
      validarPropietario: async () => {
        ownerLookups += 1;
        return true;
      },
    },
  });

  await assert.rejects(
    service.subirDatosPlanta({ idPlanta: 3, temperatura: 22, humedad: 120, idUsuario: 'user-uuid' }),
    (error) => error.statusCode === 400,
  );
  assert.equal(ownerLookups, 0);
});

test('bloquea escritura de mediciones para plantas de otro usuario', async () => {
  let writes = 0;
  let ownershipArgs;
  const service = new SensoresService({
    repository: {
      obtenerUltimaHumedad: async () => 40,
      insertarDatosRegistrados: async () => { writes += 1; },
    },
    plantService: {
      validarPropietario: async (...args) => {
        ownershipArgs = args;
        return false;
      },
    },
  });

  await assert.rejects(
    service.subirDatosPlanta({ idPlanta: 3, temperatura: 22, humedad: 40, idUsuario: 'other-user' }),
    (error) => error.statusCode === 403,
  );
  assert.equal(writes, 0);
  assert.deepEqual(ownershipArgs, [3, 'other-user']);
});

test('rechaza fechas y duraciones de riego inválidas', async () => {
  const service = new SensoresService();
  await assert.rejects(
    service.registrarUltimoRiego({ idPlanta: 3, duracionRiego: -1, idUsuario: 'user-uuid' }),
    (error) => error.statusCode === 400,
  );
  await assert.rejects(
    service.registrarUltimoRiego({ idPlanta: 3, duracionRiego: 10, fecha: 'mañana', idUsuario: 'user-uuid' }),
    (error) => error.statusCode === 400,
  );
});
