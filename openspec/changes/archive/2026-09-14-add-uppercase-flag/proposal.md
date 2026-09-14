## Why

Algunos usuarios quieren el saludo enfatizado (ej. para banners de terminal o para copiar/pegar en contextos donde el énfasis importa). El CLI `saludo` actualmente no tiene forma de cambiar la capitalización de la salida.

## What Changes

- Agregar un flag booleano `--mayusculas` al CLI `saludo` que imprima el saludo completo (frase + nombre) en mayúsculas.
- El flag no lleva valor — su sola presencia activa la salida en mayúsculas.
- Funciona en combinación con la frase por defecto y con una frase personalizada `--mensaje`/`-m`.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `greeting-cli`: agrega un nuevo requirement (flag de salida en mayúsculas) sobre el comportamiento de saludo existente; ningún requirement existente cambia su comportamiento.

## Impact

- `src/greet.js`: extender el formateo del saludo para soportar una transformación a mayúsculas.
- `bin/saludo.js`: parsear el nuevo flag `--mayusculas` y propagarlo.
- Los tests existentes siguen siendo válidos; se agregan tests nuevos para cubrir el flag.
