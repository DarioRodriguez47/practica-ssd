'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const CLI_PATH = path.join(__dirname, '..', 'bin', 'saludo.js');

function runCli(args) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], { encoding: 'utf8' });
}

test('CLI: default greeting', () => {
  const result = runCli(['Juan']);
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), 'Hola, Juan!');
});

test('CLI: missing name argument', () => {
  const result = runCli([]);
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /nombre/i);
});

test('CLI: empty/whitespace-only name argument', () => {
  const result = runCli(['   ']);
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, '');
});

test('CLI: name with surrounding whitespace is trimmed', () => {
  const result = runCli([' Juan ']);
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), 'Hola, Juan!');
});

test('CLI: custom greeting phrase via --mensaje', () => {
  const result = runCli(['Juan', '--mensaje', 'Buenos días']);
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), 'Buenos días, Juan!');
});

test('CLI: custom greeting phrase via -m shorthand', () => {
  const result = runCli(['Juan', '-m', 'Buenas noches']);
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), 'Buenas noches, Juan!');
});

test('CLI: custom greeting phrase with surrounding whitespace is trimmed', () => {
  const result = runCli(['Juan', '--mensaje', '  Buenos días  ']);
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), 'Buenos días, Juan!');
});

test('CLI: empty custom greeting phrase', () => {
  const result = runCli(['Juan', '--mensaje', '   ']);
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, '');
});
