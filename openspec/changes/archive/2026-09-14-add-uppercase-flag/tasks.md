## 1. Parsing de argumentos

- [x] 1.1 Parsear el flag booleano `--mayusculas` en `parseArgs` (`src/greet.js`) y verificar que no interfiera con el parsing existente de `--mensaje`/`-m`/nombre, mediante un test unitario

## 2. Lógica de saludo

- [x] 2.1 Aplicar una transformación a mayúsculas al saludo formateado final cuando `--mayusculas` está presente, después del trim y después de elegir la frase (por defecto o personalizada), y verificar con un test unitario que preserve correctamente los caracteres acentuados (ej. `días` → `DÍAS`)
- [x] 2.2 Conectar `--mayusculas` a través de `bin/saludo.js` y verificar manualmente que `saludo Juan --mayusculas` imprima `HOLA, JUAN!`

## 3. Tests y verificación

- [x] 3.1 Agregar tests automatizados que cubran todos los escenarios de `specs/greeting-cli/spec.md` para este cambio (mayúsculas con frase por defecto, mayúsculas con frase personalizada `--mensaje`, flag ausente deja la capitalización sin cambios) y verificar que la suite completa de tests pase
- [x] 3.2 Re-ejecutar la suite de tests existente (`npm test`) y verificar que no haya regresiones en los escenarios anteriores (saludo por defecto, validación, comportamiento de `--mensaje`)
