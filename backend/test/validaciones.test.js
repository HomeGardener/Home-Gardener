import assert from 'node:assert/strict';
import test from 'node:test';
import { validaciones } from '../src/utils/validaciones.js';

const validate = new validaciones();

test('valida emails y nombres sin aceptar espacios vacíos', () => {
  assert.equal(validate.isValidEmail(' jardin@example.com '), true);
  assert.equal(validate.isValidEmail('jardin@'), false);
  assert.equal(validate.isValidString(' Rosa '), true);
  assert.equal(validate.isValidString('  '), false);
});

test('valida contraseñas con longitud limitada', () => {
  assert.equal(validate.isValidPassword('jardin123'), true);
  assert.equal(validate.isValidPassword('jardin'), false);
  assert.equal(validate.isValidPassword(`A1${'x'.repeat(71)}`), false);
  assert.equal(validate.isValidPassword(`Aa1${'🌿'.repeat(20)}`), false);
});

test('rechaza identificadores que no sean enteros positivos seguros', () => {
  assert.equal(validate.isEnteroPositivo(1), true);
  assert.equal(validate.isEnteroPositivo(1.5), false);
  assert.equal(validate.isEnteroPositivo(Number.MAX_SAFE_INTEGER + 1), false);
  assert.equal(validate.isEnteroPositivo('1'), false);
});

test('limita humedad y temperatura a rangos admitidos', () => {
  assert.equal(validate.isValidHumidity(0), true);
  assert.equal(validate.isValidHumidity(100), true);
  assert.equal(validate.isValidHumidity(-1), false);
  assert.equal(validate.isValidHumidity(101), false);
  assert.equal(validate.isValidTemperature(-40), true);
  assert.equal(validate.isValidTemperature(85), true);
  assert.equal(validate.isValidTemperature(86), false);
  assert.equal(validate.isValidTemperature(Infinity), false);
});

test('acepta fechas válidas y rechaza valores ausentes o mal formados', () => {
  assert.equal(validate.isValidDate('2026-09-28T12:00:00.000Z'), true);
  assert.equal(validate.isValidDate('not-a-date'), false);
  assert.equal(validate.isValidDate(''), false);
});
