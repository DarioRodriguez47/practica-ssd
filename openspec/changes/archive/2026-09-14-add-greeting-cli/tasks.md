## 1. Configuración del proyecto

- [x] 1.1 Inicializar `package.json` (nombre, versión, punto de entrada `bin` apuntando al script del CLI) y verificar que `npm install` corra sin errores
- [x] 1.2 Crear el script de entrada del CLI (ej. `bin/saludo.js`) con una línea shebang y verificar que sea ejecutable vía `node bin/saludo.js <nombre>`

## 2. Parsing de argumentos

- [x] 2.1 Parsear el argumento posicional de nombre y el flag `--mensaje`/`-m` desde `process.argv`, y verificar que el parsing funcione tanto para `--mensaje=X` como para `-m X`
- [x] 2.2 Recortar (trim) espacios en blanco al inicio/final del nombre y del valor de `--mensaje` antes de validar/formatear, y verificarlo con un test unitario
- [x] 2.3 Implementar la validación de entrada (nombre faltante, nombre vacío/solo espacios tras el trim, valor de `--mensaje` vacío/solo espacios tras el trim) que imprima un error de uso en stderr y termine con código distinto de cero, y verificar cada caso mediante invocación manual o un test

## 3. Lógica de saludo

- [x] 3.1 Implementar la constante de la frase de saludo por defecto y la función de formateo del mensaje que combina frase + nombre, y verificarlo con un test unitario
- [x] 3.2 Conectar `--mensaje`/`-m` para sobrescribir la frase por defecto en esa invocación, y verificarlo con un test unitario

## 4. Tests y verificación

- [x] 4.1 Agregar tests automatizados que cubran todos los escenarios de `specs/greeting-cli/spec.md` (saludo por defecto, nombre faltante, nombre vacío, nombre con espacios al inicio/final, frase personalizada vía `--mensaje`, frase personalizada vía `-m`, frase personalizada vacía, frase personalizada con espacios al inicio/final) y verificar que la suite de tests pase
- [x] 4.2 Ejecutar manualmente `saludo Juan` y `saludo Juan --mensaje "Buenos días"` y verificar que la salida impresa coincida con el formato y códigos de salida esperados
