## 1. Project Setup

- [x] 1.1 Initialize `package.json` (name, version, `bin` entry pointing to the CLI script) and verify `npm install` runs cleanly
- [x] 1.2 Create the CLI entry script (e.g. `bin/saludo.js`) with a shebang line and verify it is executable via `node bin/saludo.js <name>`

## 2. Argument Parsing

- [x] 2.1 Parse the positional name argument and the `--mensaje`/`-m` flag from `process.argv` and verify parsing works for both `--mensaje=X` and `-m X` forms
- [x] 2.2 Trim leading/trailing whitespace from the name and `--mensaje` values before validation/formatting, and verify via a unit test
- [x] 2.3 Implement input validation (missing name, empty/whitespace-only name after trimming, empty/whitespace-only `--mensaje` value after trimming) that prints a usage error to stderr and exits non-zero, and verify each case via manual invocation or a test

## 3. Greeting Logic

- [x] 3.1 Implement the default greeting phrase constant and the message-formatting function that combines phrase + name, and verify it via a unit test
- [x] 3.2 Wire `--mensaje`/`-m` to override the default phrase for that invocation and verify via a unit test

## 4. Tests & Verification

- [x] 4.1 Add automated tests covering all scenarios in `specs/greeting-cli/spec.md` (default greeting, missing name, empty name, name with surrounding whitespace, custom phrase via `--mensaje`, custom phrase via `-m`, empty custom phrase, custom phrase with surrounding whitespace) and verify the test suite passes
- [x] 4.2 Manually run `saludo Juan` and `saludo Juan --mensaje "Buenos días"` and verify the printed output matches the expected format and exit codes
