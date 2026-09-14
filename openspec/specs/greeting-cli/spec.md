# Especificación: greeting-cli

## Purpose

Provee una interfaz de línea de comandos que saluda a una persona por su nombre, permitiendo opcionalmente sobrescribir la frase de saludo (ej. "Hola" vs "Buenos días") en lugar de estar limitado a un único mensaje fijo.

## Requirements

### Requirement: Saludar a una persona por nombre
El CLI SHALL aceptar un argumento de nombre obligatorio e imprimir un mensaje de saludo que combine una frase de saludo con ese nombre en stdout. El nombre SHALL recortarse (trim) de espacios en blanco al inicio/final antes de usarse en el saludo o de validarse como vacío.

#### Scenario: Saludo por defecto
- **WHEN** el comando se invoca con un nombre y sin flag de mensaje personalizado (ej. `saludo Juan`)
- **THEN** el CLI imprime un saludo usando la frase por defecto y el nombre dado (ej. `Hola, Juan!`) y termina con código 0

#### Scenario: Falta el argumento de nombre
- **WHEN** el comando se invoca sin un argumento de nombre
- **THEN** el CLI imprime un error de uso en stderr y termina con un código de salida distinto de cero, sin imprimir ningún saludo

#### Scenario: Argumento de nombre vacío o solo espacios
- **WHEN** el comando se invoca con un argumento de nombre vacío o que contiene solo espacios en blanco
- **THEN** el CLI imprime un error de uso en stderr y termina con un código de salida distinto de cero, sin imprimir ningún saludo

#### Scenario: Nombre con espacios al inicio/final
- **WHEN** el comando se invoca con un nombre que tiene espacios en blanco al inicio/final pero contenido no vacío (ej. `saludo " Juan "`)
- **THEN** el CLI recorta los espacios e imprime el saludo usando el nombre recortado (ej. `Hola, Juan!`), sin espacios extra

### Requirement: Frase de saludo personalizable
El CLI SHALL soportar un flag `--mensaje` (con `-m` como forma corta) que sobrescribe la frase de saludo por defecto para esa invocación puntual. La frase personalizada SHALL recortarse (trim) de espacios en blanco al inicio/final antes de usarse o de validarse como vacía.

#### Scenario: Frase de saludo personalizada provista
- **WHEN** el comando se invoca con un nombre y `--mensaje "Buenos días"` (ej. `saludo Juan --mensaje "Buenos días"`)
- **THEN** el CLI imprime la frase personalizada combinada con el nombre (ej. `Buenos días, Juan!`) en lugar de la frase por defecto, y termina con código 0

#### Scenario: Frase de saludo personalizada vía flag corto
- **WHEN** el comando se invoca con un nombre y `-m "Buenas noches"`
- **THEN** el CLI imprime la frase personalizada combinada con el nombre y termina con código 0

#### Scenario: Frase de saludo personalizada vacía
- **WHEN** el comando se invoca con `--mensaje` configurado con un valor vacío o solo espacios en blanco
- **THEN** el CLI imprime un error de uso en stderr y termina con un código de salida distinto de cero, sin imprimir ningún saludo

#### Scenario: Frase de saludo personalizada con espacios al inicio/final
- **WHEN** el comando se invoca con `--mensaje` configurado con un valor que tiene espacios en blanco al inicio/final pero contenido no vacío (ej. `--mensaje "  Buenos días  "`)
- **THEN** el CLI recorta los espacios y usa la frase recortada en el saludo, sin espacios extra

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
