# OpenSpec: skills instaladas, versionamiento y cosas a tener en cuenta

Este doc complementa a `OPENSPEC-GUIA.md`. Aquí va: (1) el detalle exacto de las 6 skills que se instalaron en `.claude/`, (2) cómo se debe manejar git/versionamiento en esta metodología, y (3) gotchas que conviene conocer **antes** de tu primer `/opsx:propose`.

---

## 1. Las 6 skills instaladas (perfil `core`)

Cada una vive en `.claude/skills/<nombre>/SKILL.md` + su comando en `.claude/commands/opsx/`. Son instrucciones en markdown que Claude Code lee cuando invocas el slash command — no son "IA aparte", son un modo de operar dentro de esta misma conversación.

### `/opsx:explore` → skill `openspec-explore`
- **Rol**: compañero de pensamiento, no un generador de artefactos.
- **Nunca escribe código.** Puede leer/investigar código libremente sin pedir permiso, pero antes de la primera acción que *escribe* algo (incluso crear un change) debe describir qué va a hacer y esperar tu confirmación explícita en un mensaje separado.
- Usa diagramas ASCII para visualizar arquitectura, flujos, comparaciones de opciones.
- Puede terminar en: una propuesta formal, artefactos actualizados, o simplemente claridad — no está obligado a producir nada.

### `/opsx:propose` → skill `openspec-propose`
- Crea el change **y genera todos los artefactos de planeación en un solo paso** (proposal, delta specs, design, tasks según el schema `spec-driven`).
- **Límite explícito**: "esto crea solo artefactos de planeación. Aunque tu pedido original mencione 'construir' o 'arreglar' algo, NO edita código." Se detiene después de presentar el plan y espera que tú pidas explícitamente `/opsx:apply`.
- Si algo es ambiguo y afecta alcance/comportamiento observable, te pregunta antes de crear el change; para detalles menores, asume razonablemente y lo anota.

### `/opsx:apply` → skill `openspec-apply-change`
- Implementa las tareas de `tasks.md` una por una, marcando `- [ ]` → `- [x]` a medida que completa cada una.
- Se **detiene y pregunta** si: una tarea es ambigua, la implementación revela un problema de diseño, la tarea requiere más alcance del que describe el spec, o hay un error/bloqueo. Nunca "absorbe" silenciosamente trabajo extra ni recorta comportamiento especificado.
- Mantiene los cambios de código mínimos y enfocados a cada tarea puntual.

### `/opsx:update` → skill `openspec-update-change`
- Revisa artefactos de planeación **ya existentes** para mantenerlos coherentes entre sí (ej: cambiaste el diseño → hay que revisar si el proposal o las tasks quedaron desalineados).
- **Nunca edita código.** Solo edita archivos que ya existen — no crea artefactos nuevos que falten (eso es trabajo de `/opsx:continue`, del perfil expandido).
- Te muestra cada revisión propuesta y espera confirmación antes de escribir, artefacto por artefacto.
- Si el cambio que pides altera la *intención* del change (no solo la refina), sugiere empezar un change nuevo en vez de forzar la actualización.

### `/opsx:sync` → skill `openspec-sync-specs`
- Fusiona los **delta specs** de un change hacia los **specs principales**, sin archivar el change todavía.
- Es una fusión **inteligente hecha por el agente**, no un merge mecánico: por ejemplo, puede agregar un solo escenario nuevo a un requisito existente en vez de sobrescribir todo el bloque.
- Reglas de fusión:
  - `ADDED` → si el requisito no existe, se agrega; si ya existe, se actualiza.
  - `MODIFIED` → agrega/cambia escenarios, preserva lo que el delta no menciona.
  - `REMOVED` → borra el bloque de requisito completo (y borra el archivo entero solo si no queda nada más y se cumplen varias condiciones de seguridad).
  - `RENAMED` → renombra el requisito.
- Es **idempotente**: correrlo dos veces da el mismo resultado.

### `/opsx:archive` → skill `openspec-archive-change`
- Cierra el ciclo: revisa que las tareas estén completas (avisa si no, pero no bloquea — te pregunta si igual quieres archivar).
- Si hay delta specs sin sincronizar, te ofrece sincronizarlos primero (recomendado) o archivar sin sincronizar.
- Mueve la carpeta del change a `openspec/changes/archive/YYYY-MM-DD-<nombre>/`.
- Nunca archiva mientras una sincronización sigue en curso — se asegura de que termine antes de mover la carpeta.

### Resumen visual del flujo entre skills

```
/opsx:explore  (pensar, opcional)
      |
      v
/opsx:propose  (crea change + TODOS los artefactos de planeación)
      |
      v
  [revisas el plan]
      |
      v
/opsx:apply    (implementa tasks.md, código real)
      |
      v
/opsx:update   (si algo quedó desalineado, opcional, en cualquier punto)
      |
      v
/opsx:sync     (delta specs -> specs principales)
      |
      v
/opsx:archive  (mueve el change a archive/, cierra el ciclo)
```

---

## 2. Cómo se maneja el versionamiento (git) en esta metodología

**Punto clave, y la corrección más importante de tu mensaje anterior: OpenSpec no toca git.** Cito la documentación oficial:

> *"OpenSpec reads and writes plain Markdown under `openspec/`. It never commits, branches, pushes, or pulls in your project."*

Ninguna de las 6 skills de arriba ejecuta `git add`, `git commit`, `git push` ni nada parecido — de hecho, sus "allowed-tools" están restringidos a `Bash(openspec:*)`, es decir, **solo** pueden correr comandos `openspec`, no comandos de git arbitrarios. El versionamiento sigue siendo 100% manual, tuyo.

### Flujo recomendado (equipo o solo)

```
1. git switch -c add-dark-mode          ← tú creas la rama para el change
2. /opsx:propose "modo oscuro"          ← genera proposal + specs + design + tasks
3. git add . && git commit -m "..."     ← commiteas el PLAN (antes de programar)
4. /opsx:apply                          ← implementa el código
5. git add . && git commit -m "..."     ← commiteas la implementación
6. /opsx:sync                           ← fusiona delta specs -> specs principales
7. git add . && git commit -m "..."
8. Pull Request                         ← el reviewer ve el spec ANTES que el diff de código
9. /opsx:archive (tras mergear)         ← mueve el change a archive/
10. git add . && git commit -m "..."
```

### Por qué esto importa

- Un *change* es literalmente **una carpeta versionable como cualquier código**: `openspec/changes/add-dark-mode/` son archivos en tu rama, nada especial.
- Como el plan (`proposal.md`, delta specs) y el código quedan en el mismo commit/PR, tu reviewer puede leer primero "qué se pretendía hacer" y después el diff de implementación — reduce el "esto no es lo que pedí" después del hecho.
- Como todo son archivos `.md` planos, **los conflictos de merge se resuelven igual que en cualquier archivo de texto** — no hay nada mágico ni una base de datos especial detrás.

### Cosas a decidir tú (OpenSpec no te lo impone)

- **¿Committear el plan por separado de la implementación, o todo junto?** Ambos son válidos; committear el plan aparte facilita que alguien lo revise antes de que exista código.
- **¿`openspec/changes/archive/` se queda en el repo para siempre?** Sí, por diseño — es tu registro histórico auditable. No lo borres pensando que es basura.
- **`.gitignore`**: no hay recomendación oficial documentada; en general **todo `openspec/` debería versionarse** (specs y changes son la razón de ser de la herramienta), no hay archivos generados/temporales que excluir por defecto.

---

## 3. Cosas pequeñas que probablemente no tomamos en cuenta

### Sobre la instalación/setup (ya resueltas en tu caso, pero quedan documentadas)
- **PATH**: instalar el CLI global no garantiza que quede accesible en el PATH del sistema — si en algún momento `openspec` deja de reconocerse en una terminal nueva, es lo primero a chequear.
- **Node 20.19.0+** es el mínimo. Tienes v24, sin problema.
- Los comandos `/opsx:*` **no aparecen hasta reiniciar/abrir una ventana nueva** de Claude Code — muchos asistentes de IA solo escanean los comandos disponibles al arrancar.

### Sobre el uso diario
- **Los slash commands van en el chat de Claude Code, NUNCA en la terminal.** `openspec` (sin barra) es el CLI de terminal; `/opsx:propose` (con barra) es exclusivamente del chat. Son dos superficies distintas — es el error más común de gente empezando.
- **`openspec init` es por proyecto.** Si en el futuro clonas otro repo o trabajas en otra carpeta, tienes que correr `openspec init` de nuevo ahí — no es una instalación global que "ya sabe" en qué proyecto estás.
- **El archivo de config debe llamarse exactamente `openspec/config.yaml`** (no `.yml`) con YAML válido, o no se lee.
- **El campo `context` en `config.yaml` tiene un límite de 50KB.** Si metes demasiado contexto de proyecto ahí, en vez de ayudar **degrada** la calidad de lo que genera la IA — menos es más.
- **`/opsx:update` nunca toca código**, solo planeación. Si una revisión de plan implica cambiar código ya escrito, te va a redirigir a `/opsx:apply`.
- **`/opsx:sync` es idempotente** — no rompe nada si lo corres dos veces por error.
- Tras archivar, `/opsx:archive` avisa si había tareas incompletas o artefactos sin terminar, pero **no bloquea** — te pregunta si igual quieres seguir. Es intencional (fluido, no rígido), pero significa que puedes archivar algo a medio hacer si no prestas atención al aviso.

### Sobre el perfil activo en este proyecto
- Ahora mismo tienes el perfil **core** (los 6 comandos de este doc). El perfil **expandido** (`/opsx:new`, `/opsx:continue`, `/opsx:ff`, `/opsx:verify`, `/opsx:bulk-archive`, `/opsx:onboard`) da más control granular pero no está instalado — se activa con `openspec config profile` si más adelante lo necesitas (por ejemplo, `/opsx:onboard` es el tutorial guiado interactivo, muy útil para tu primera vez).

### Sobre la filosofía (para no repetir el malentendido anterior)
- No hay que "documentar toda la arquitectura antes de empezar". Los specs se llenan orgánicamente, change por change, a partir de trabajo real — documentar código que no vas a tocar "se siente productivo pero usualmente no lo es" (cita textual de la doc), porque nadie fuerza que esos specs se mantengan al día.
- Empieza con algo **pequeño y real** que ya ibas a hacer — no un ejercicio de juguete — para tu primer `/opsx:propose`.

---

## 4. Fuentes usadas para este documento

- SKILL.md reales instalados en este repo: `.claude/skills/*/SKILL.md`
- https://github.com/Fission-AI/OpenSpec/blob/main/docs/team-workflow.md (relación con git)
- https://github.com/Fission-AI/OpenSpec/blob/main/docs/existing-projects.md (adopción incremental)
- https://github.com/Fission-AI/OpenSpec/blob/main/docs/troubleshooting.md
- https://github.com/Fission-AI/OpenSpec/blob/main/docs/faq.md
