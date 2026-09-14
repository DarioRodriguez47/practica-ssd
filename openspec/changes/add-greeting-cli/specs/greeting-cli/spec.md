## Purpose

Provides a command-line interface that greets a person by name, letting the caller optionally override the greeting phrase (e.g. "Hola" vs "Buenos días") instead of being limited to one fixed message.

## ADDED Requirements

### Requirement: Greet a named person
The CLI SHALL accept a required name argument and print a greeting message combining a greeting phrase and that name to stdout.

#### Scenario: Default greeting
- **WHEN** the command is invoked with a name and no custom message flag (e.g. `saludo Juan`)
- **THEN** the CLI prints a greeting using the default phrase and the given name (e.g. `Hola, Juan!`) and exits with code 0

#### Scenario: Missing name argument
- **WHEN** the command is invoked without a name argument
- **THEN** the CLI prints a usage error to stderr and exits with a non-zero exit code, without printing any greeting

#### Scenario: Empty or whitespace-only name argument
- **WHEN** the command is invoked with a name argument that is empty or contains only whitespace
- **THEN** the CLI prints a usage error to stderr and exits with a non-zero exit code, without printing any greeting

### Requirement: Customizable greeting phrase
The CLI SHALL support a `--mensaje` flag (with `-m` shorthand) that overrides the default greeting phrase for that single invocation.

#### Scenario: Custom greeting phrase provided
- **WHEN** the command is invoked with a name and `--mensaje "Buenos días"` (e.g. `saludo Juan --mensaje "Buenos días"`)
- **THEN** the CLI prints the custom phrase combined with the name (e.g. `Buenos días, Juan!`) instead of the default phrase, and exits with code 0

#### Scenario: Custom greeting phrase via shorthand flag
- **WHEN** the command is invoked with a name and `-m "Buenas noches"`
- **THEN** the CLI prints the custom phrase combined with the name and exits with code 0

#### Scenario: Empty custom greeting phrase
- **WHEN** the command is invoked with `--mensaje` set to an empty or whitespace-only value
- **THEN** the CLI prints a usage error to stderr and exits with a non-zero exit code, without printing any greeting
