'use strict';

const DEFAULT_GREETING = 'Hola';

class UsageError extends Error {}

function parseArgs(argv) {
  let message;
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--mensaje' || arg === '-m') {
      message = argv[i + 1] ?? '';
      i++;
    } else if (arg.startsWith('--mensaje=')) {
      message = arg.slice('--mensaje='.length);
    } else {
      positional.push(arg);
    }
  }

  return { name: positional[0], message };
}

function formatGreeting(name, message) {
  const trimmedName = (name ?? '').trim();
  if (!trimmedName) {
    throw new UsageError('Falta el nombre. Uso: saludo <nombre> [--mensaje "Frase"]');
  }

  let phrase = DEFAULT_GREETING;
  if (message !== undefined) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw new UsageError('El mensaje personalizado (--mensaje) no puede estar vacío.');
    }
    phrase = trimmedMessage;
  }

  return `${phrase}, ${trimmedName}!`;
}

module.exports = { DEFAULT_GREETING, UsageError, parseArgs, formatGreeting };
