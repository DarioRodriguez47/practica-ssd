## Why

Todavía no existe ningún CLI en este proyecto. Necesitamos un punto de entrada de línea de comandos simple que salude a una persona por su nombre, con la posibilidad de personalizar la frase de saludo (ej. "Hola" vs "Buenos días") en lugar de quedar fijo a un único mensaje hardcodeado.

## What Changes

- Agregar un nuevo comando CLI de Node.js (`saludo`) que acepte un argumento de nombre obligatorio e imprima un saludo.
- Agregar un flag `--mensaje` / `-m` para sobrescribir la frase de saludo por defecto en una invocación puntual.
- Definir una frase de saludo por defecto que se use cuando no se provee `--mensaje`.
- Validar la entrada: rechazar un nombre faltante/vacío con un error de uso claro y un código de salida distinto de cero.

## Capabilities

### New Capabilities
- `greeting-cli`: comando CLI que recibe un nombre y opcionalmente una frase de saludo personalizada, e imprime un mensaje de saludo formateado en stdout.

### Modified Capabilities
(ninguna — proyecto greenfield, sin specs existentes)

## Impact

- Nuevo paquete/ejecutable de Node.js (ej. `bin/saludo.js` o equivalente) junto con su punto de entrada en `package.json`.
- No afecta código, APIs ni sistemas existentes — es la primera capability agregada al proyecto.
