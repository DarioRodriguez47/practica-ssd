## ADDED Requirements

### Requirement: Flag de salida en mayúsculas
El CLI SHALL soportar un flag booleano `--mayusculas` (sin valor) que, cuando está presente, imprime el saludo completo (frase y nombre, después del trim y después de aplicar cualquier sobrescritura `--mensaje`/`-m`) en mayúsculas en lugar de su capitalización original.

#### Scenario: Flag de mayúsculas con frase por defecto
- **WHEN** el comando se invoca con un nombre y `--mayusculas` (ej. `saludo Juan --mayusculas`)
- **THEN** el CLI imprime el saludo por defecto completo en mayúsculas (ej. `HOLA, JUAN!`) y termina con código 0

#### Scenario: Flag de mayúsculas combinado con frase personalizada
- **WHEN** el comando se invoca con un nombre, una frase personalizada `--mensaje`, y `--mayusculas` (ej. `saludo Juan --mensaje "Buenos días" --mayusculas`)
- **THEN** el CLI imprime la frase personalizada y el nombre completos en mayúsculas (ej. `BUENOS DÍAS, JUAN!`) y termina con código 0

#### Scenario: Flag de mayúsculas ausente
- **WHEN** el comando se invoca sin `--mayusculas`
- **THEN** el CLI imprime el saludo con su capitalización original, sin verse afectado por este requirement
