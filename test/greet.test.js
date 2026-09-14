'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { formatGreeting, parseArgs, UsageError, DEFAULT_GREETING } = require('../src/greet');

test('parseArgs reads the positional name', () => {
  assert.deepEqual(parseArgs(['Juan']), { name: 'Juan', message: undefined });
});

test('parseArgs reads --mensaje with a separate value', () => {
  assert.deepEqual(parseArgs(['Juan', '--mensaje', 'Buenos días']), {
    name: 'Juan',
    message: 'Buenos días',
  });
});

test('parseArgs reads --mensaje=value form', () => {
  assert.deepEqual(parseArgs(['Juan', '--mensaje=Buenos días']), {
    name: 'Juan',
    message: 'Buenos días',
  });
});

test('parseArgs reads -m shorthand', () => {
  assert.deepEqual(parseArgs(['Juan', '-m', 'Buenas noches']), {
    name: 'Juan',
    message: 'Buenas noches',
  });
});

test('formatGreeting uses the default phrase when no message is given', () => {
  assert.equal(formatGreeting('Juan', undefined), `${DEFAULT_GREETING}, Juan!`);
});

test('formatGreeting uses a custom phrase when provided', () => {
  assert.equal(formatGreeting('Juan', 'Buenos días'), 'Buenos días, Juan!');
});

test('formatGreeting trims surrounding whitespace from the name', () => {
  assert.equal(formatGreeting(' Juan ', undefined), `${DEFAULT_GREETING}, Juan!`);
});

test('formatGreeting trims surrounding whitespace from the custom message', () => {
  assert.equal(formatGreeting('Juan', '  Buenos días  '), 'Buenos días, Juan!');
});

test('formatGreeting rejects a missing name', () => {
  assert.throws(() => formatGreeting(undefined, undefined), UsageError);
});

test('formatGreeting rejects an empty/whitespace-only name', () => {
  assert.throws(() => formatGreeting('   ', undefined), UsageError);
});

test('formatGreeting rejects an empty/whitespace-only custom message', () => {
  assert.throws(() => formatGreeting('Juan', '   '), UsageError);
});
