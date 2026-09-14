## Why

No CLI exists yet in this project. We need a simple command-line entry point that greets a person by name, with the ability to customize the greeting phrase (e.g. "Hola" vs "Buenos días") instead of being locked to a single hardcoded message.

## What Changes

- Add a new Node.js CLI command (`saludo`) that accepts a required name argument and prints a greeting.
- Add a `--mensaje` / `-m` flag to override the default greeting phrase for a single invocation.
- Define a default greeting phrase used when `--mensaje` is not provided.
- Validate input: reject a missing/empty name with a clear usage error and a non-zero exit code.

## Capabilities

### New Capabilities
- `greeting-cli`: CLI command that takes a name and an optional custom greeting phrase and prints a formatted greeting message to stdout.

### Modified Capabilities
(none — greenfield project, no existing specs)

## Impact

- New Node.js package/executable (e.g. `bin/saludo.js` or equivalent) plus its `package.json` entry point.
- No existing code, APIs, or systems affected — this is the first capability added to the project.
