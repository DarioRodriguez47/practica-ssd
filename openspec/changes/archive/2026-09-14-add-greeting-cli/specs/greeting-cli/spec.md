## Purpose

Provides a command-line interface that greets a person by name, letting the caller optionally override the greeting phrase (e.g. "Hola" vs "Buenos días") instead of being limited to one fixed message.

## ADDED Requirements

### Requirement: Greet a named person
The CLI SHALL accept a required name argument and print a greeting message combining a greeting phrase and that name to stdout. The name SHALL be trimmed of leading/trailing whitespace before being used in the greeting or validated as empty.

#### Scenario: Default greeting
- **WHEN** the command is invoked with a name and no custom message flag (e.g. `saludo Juan`)
- **THEN** the CLI prints a greeting using the default phrase and the given name (e.g. `Hola, Juan!`) and exits with code 0

#### Scenario: Missing name argument
- **WHEN** the command is invoked without a name argument
- **THEN** the CLI prints a usage error to stderr and exits with a non-zero exit code, without printing any greeting

#### Scenario: Empty or whitespace-only name argument
- **WHEN** the command is invoked with a name argument that is empty or contains only whitespace
- **THEN** the CLI prints a usage error to stderr and exits with a non-zero exit code, without printing any greeting

#### Scenario: Name with surrounding whitespace
- **WHEN** the command is invoked with a name that has leading/trailing whitespace but non-empty content (e.g. `saludo " Juan "`)
- **THEN** the CLI trims the whitespace and prints the greeting using the trimmed name (e.g. `Hola, Juan!`), with no extra spaces

### Requirement: Customizable greeting phrase
The CLI SHALL support a `--mensaje` flag (with `-m` shorthand) that overrides the default greeting phrase for that single invocation. The custom phrase SHALL be trimmed of leading/trailing whitespace before being used or validated as empty.

#### Scenario: Custom greeting phrase provided
- **WHEN** the command is invoked with a name and `--mensaje "Buenos días"` (e.g. `saludo Juan --mensaje "Buenos días"`)
- **THEN** the CLI prints the custom phrase combined with the name (e.g. `Buenos días, Juan!`) instead of the default phrase, and exits with code 0

#### Scenario: Custom greeting phrase via shorthand flag
- **WHEN** the command is invoked with a name and `-m "Buenas noches"`
- **THEN** the CLI prints the custom phrase combined with the name and exits with code 0

#### Scenario: Empty custom greeting phrase
- **WHEN** the command is invoked with `--mensaje` set to an empty or whitespace-only value
- **THEN** the CLI prints a usage error to stderr and exits with a non-zero exit code, without printing any greeting

#### Scenario: Custom greeting phrase with surrounding whitespace
- **WHEN** the command is invoked with `--mensaje` set to a value with leading/trailing whitespace but non-empty content (e.g. `--mensaje "  Buenos días  "`)
- **THEN** the CLI trims the whitespace and uses the trimmed phrase in the greeting, with no extra spaces
