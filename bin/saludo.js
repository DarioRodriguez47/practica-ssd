#!/usr/bin/env node
'use strict';

const { parseArgs, formatGreeting, UsageError } = require('../src/greet');

const { name, message } = parseArgs(process.argv.slice(2));

try {
  console.log(formatGreeting(name, message));
} catch (err) {
  if (err instanceof UsageError) {
    console.error(err.message);
    process.exit(1);
  }
  throw err;
}
