# Metodología del proyecto: OpenSpec (Spec-Driven Development)

Este proyecto usa **OpenSpec**, una metodología de desarrollo dirigido por especificaciones (*Spec-Driven Development*, de ahí "SSD"). La idea central: **antes de tocar código, se escribe qué se va a construir y por qué**, en documentos versionados (`.md`), y luego se implementa siguiendo ese plan. El código nunca es la única fuente de verdad de "qué debe hacer el sistema" — las specs lo son.

Está integrado con Claude Code vía **skills** (`.claude/skills/openspec-*`) y **slash commands** (`/opsx:*`). El CLI subyacente es `openspec` (v1.13.0 instalado, disponible en PATH).

---

## 1. Conceptos clave

| Concepto | Qué es |
|---|---|
| **Capability (capacidad)** | Una pieza de funcionalidad del sistema con nombre propio (ej. `user-auth`, `billing/invoices`). Vive como carpeta bajo `openspec/specs/<capability-path>/`. |
| **Main spec** | El archivo `openspec/specs/<capability>/spec.md`. Es la especificación **actual y vigente** de esa capacidad: su Purpose y sus Requirements con Scenarios. Es la fuente de verdad de "qué hace el sistema hoy". |
| **Change (cambio)** | Una propuesta de modificación al sistema. Vive en `openspec/changes/<nombre-del-cambio>/` mientras está activa. Contiene artefactos de planificación (proposal, design, tasks) y **delta specs**. |
| **Delta spec** | Un `spec.md` dentro de un `change`, bajo `changes/<nombre>/specs/<capability>/spec.md`. No es la spec completa: describe **solo lo que cambia** respecto a la main spec, usando secciones `ADDED` / `MODIFIED` / `REMOVED` / `RENAMED`. |
| **Schema** | El "tipo de workflow" que define qué artefactos requiere un cambio y en qué orden. El default de este proyecto es **`spec-driven`**: `proposal.md` → `specs/` (delta) → `design.md` → `tasks.md`. |
| **Artifact (artefacto)** | Cada documento que compone un change (proposal, design, tasks, specs). Cada uno tiene `status`: `ready`, `blocked`, `done`, `skipped`. |
| **Archive** | Cuando un change se implementa y sus deltas se sincronizan a las main specs, el change se mueve a `openspec/changes/archive/<fecha>-<nombre>/` como registro histórico. |
| **Store** | Un repo OpenSpec independiente registrado en la máquina (para trabajar contra specs fuera de este proyecto). Este proyecto no usa store externo por defecto; opera sobre `openspec/` local. |

---

## 2. Estructura de carpetas

```
openspec/
├── config.yaml              # contexto del proyecto, reglas por artefacto, guías de operación
├── specs/                    # MAIN specs — "lo que el sistema hace hoy"
│   └── <capability>/spec.md
└── changes/                  # changes activos — "lo que se está proponiendo/construyendo"
    ├── <nombre-cambio>/
    │   ├── proposal.md        # qué y por qué
    │   ├── design.md          # cómo (opcional/condicional)
    │   ├── tasks.md            # pasos de implementación
    │   ├── specs/<capability>/spec.md   # delta spec
    │   └── .openspec.yaml      # metadata del schema usado
    └── archive/
        └── YYYY-MM-DD-<nombre-cambio>/   # changes ya completados y archivados
```

En este proyecto ambas carpetas (`specs/` y `changes/archive/`) están vacías (solo `.gitkeep`) — es un proyecto recién inicializado, todavía no tiene capabilities ni changes.

---

## 2.1 Anatomía de un `change` (carpeta dentro de `openspec/changes/`)

Cada change puede tener estos artefactos. No todos son obligatorios — **rigor progresivo**: usás solo el peso que el cambio necesita.

| Artefacto | Archivo | Contenido |
|---|---|---|
| Proposal | `proposal.md` | La intención: por qué se hace, qué alcance tiene, enfoque general |
| Delta Specs | `specs/*.md` (dentro del change) | Qué cambia respecto al spec actual (ver sección 5) |
| Design | `design.md` | Cómo se hace técnicamente: arquitectura, decisiones, archivos afectados |
| Tasks | `tasks.md` | Checklist jerárquico de implementación (checkboxes) |

**Orden lógico de dependencia** (schema por defecto `spec-driven`):

```
proposal → specs (delta) → design → tasks
```

Pero son "habilitadores", no una secuencia forzada: podés saltar `design.md` si el cambio es trivial, o crear `specs` y `proposal` casi en paralelo.

### Cómo se ve en un `tree` real

Ejemplo de un proyecto ya en marcha: una capability `user-auth` ya sincronizada a main specs, un change activo `add-password-reset` en progreso (con `design.md`, tasks a medio marcar), y un change ya cerrado en `archive/`.

```
openspec/
├── config.yaml
│
├── specs/                                   # MAIN specs — estado vigente del sistema
│   ├── user-auth/
│   │   └── spec.md
│   └── billing/
│       └── invoices/
│           └── spec.md                      # capability con path anidado (identity/user-auth, billing/invoices, etc.)
│
└── changes/
    ├── add-password-reset/                   # ← change ACTIVO, todavía en curso
    │   ├── .openspec.yaml                    # metadata: schema usado (spec-driven), skip_specs, etc.
    │   ├── proposal.md                       # done
    │   ├── design.md                         # done (este change sí lo necesitó)
    │   ├── tasks.md                           # in progress — algunas [x], otras [ ]
    │   └── specs/
    │       └── user-auth/
    │           └── spec.md                    # delta: MODIFIED Requirements sobre user-auth
    │
    └── archive/
        ├── .gitkeep
        └── 2026-08-30-add-email-login/        # ← change ARCHIVADO (prefijo YYYY-MM-DD)
            ├── .openspec.yaml
            ├── proposal.md
            ├── tasks.md                        # sin design.md: se omitió por trivial
            └── specs/
                └── user-auth/
                    └── spec.md                  # delta ya fusionado a openspec/specs/user-auth/spec.md
```

Notas sobre el ejemplo:
- `add-password-reset/` no tiene todavía sus deltas fusionados a `openspec/specs/` — eso pasa recién con `/opsx:sync` o al `/opsx:archive`-arlo.
- `archive/2026-08-30-add-email-login/` **sí omitió `design.md`** — quedó fuera porque el schema lo trata como artefacto condicional, no obligatorio.
- El delta spec dentro de un change y la main spec correspondiente comparten el mismo `<capability-path>` (`user-auth`, `billing/invoices`) — eso es lo que permite a `/opsx:sync` saber qué archivo de `specs/` tiene que actualizar.
- Un change archivado conserva su carpeta `specs/` (el delta) como registro histórico de qué cambió en ese momento, aunque ya esté fusionado.

---

## 3. El ciclo de vida de un change

```
 explore (opcional, pensar)
        |
        v
   /opsx:propose  →  crea el change + genera proposal, specs (delta), design, tasks
        |
        v
   /opsx:update   →  (opcional, iterativo) revisar/ajustar artefactos antes o durante implementación
        |
        v
   /opsx:apply    →  implementa las tasks.md contra el código real, marcando [x]
        |
        v
   /opsx:sync     →  (opcional, se puede hacer aparte) fusiona el delta spec en la main spec
        |
        v
   /opsx:archive  →  mueve el change a archive/, sincronizando specs si falta
```

No es estrictamente lineal: `explore` y `update` se pueden usar en cualquier momento, y `apply` se puede invocar antes de que todos los artefactos estén completos (solo requiere que exista `tasks.md`, según el schema).

---

## 4. Los comandos `/opsx:*`

### `/opsx:explore`
**Modo de pensamiento, no de implementación.** Es un compañero de exploración: hace preguntas, dibuja diagramas ASCII, investiga el código en modo solo-lectura, compara opciones. **Nunca escribe código.** Puede crear/actualizar artefactos de un change (proposal, design, specs) pero solo con confirmación explícita del usuario antes de cada escritura. Úsalo cuando la idea todavía no está clara y quieres pensarla antes de proponerla formalmente.

### `/opsx:propose [nombre o descripción]`
Crea un change nuevo y genera **todos los artefactos requeridos por el schema** en un solo paso:
- `proposal.md` — qué se va a construir y por qué
- `specs/<capability>/spec.md` — el delta (ADDED/MODIFIED/REMOVED/RENAMED requirements)
- `design.md` — decisiones técnicas de cómo hacerlo (condicional, puede omitirse si no aplica)
- `tasks.md` — lista de pasos de implementación

**Límite estricto: solo planifica.** No escribe ni edita código de la aplicación en este paso, aunque el pedido original mencione "implementar". Al terminar, se detiene y espera una nueva instrucción del usuario para pasar a `/opsx:apply`.

Flujo interno: `openspec new change "<nombre>"` → `openspec status --change "<nombre>" --json` (para saber qué artefactos se requieren y su orden de dependencias) → por cada artefacto, `openspec instructions <id> --change "<nombre>" --json` (trae `template`, `rules`, `context` para ese artefacto) → escribe el archivo siguiendo la plantilla.

### `/opsx:apply [nombre-del-change]`
Implementa el código real siguiendo `tasks.md`. Por cada tarea pendiente (`- [ ]`):
1. Lee los artefactos de contexto (proposal, specs, design, tasks).
2. Hace el cambio de código correspondiente, mínimo y enfocado.
3. Marca la tarea como completa (`- [x]`) **solo cuando el comportamiento especificado está totalmente implementado**, nunca si quedó parcial o pospuesto.
4. Se detiene si una tarea es ambigua, si aparece un problema de diseño, si el alcance requerido excede lo que dice la spec, o ante cualquier error — y pide guía en vez de improvisar.

### `/opsx:update [nombre-del-change]`
Revisa y corrige los artefactos **de planificación** de un change ya existente para mantenerlos coherentes entre sí (por ejemplo, si el diseño cambió y ahora la proposal quedó desactualizada). **Nunca edita código.** Si la solicitud implica cambios en el código ya escrito, redirige a `/opsx:apply`. Cada edición propuesta se muestra y se confirma con el usuario antes de escribirse. Solo edita archivos que ya existen — no crea artefactos nuevos (eso es trabajo de `/opsx:propose`/continuación).

### `/opsx:sync [nombre-del-change]`
Fusiona los **delta specs** del change dentro de las **main specs** (`openspec/specs/`), sin archivar el change todavía. Es una fusión inteligente hecha por el agente (no un merge mecánico):
- `ADDED` → agrega el requirement si no existe.
- `MODIFIED` → localiza el requirement y aplica los cambios, preservando escenarios no mencionados.
- `REMOVED` → borra el bloque del requirement (y si la capability queda sin requirements y el change declara `retire_capabilities: true`, borra el `spec.md` entero).
- `RENAMED` → renombra el requirement.

Útil cuando quieres reflejar el nuevo comportamiento en las specs principales antes de que el change esté 100% terminado.

### `/opsx:archive [nombre-del-change]`
Cierra el change:
1. Verifica que los artefactos y las tasks estén completos (si no, avisa y pide confirmación para archivar igual).
2. Si hay delta specs pendientes de fusionar, ofrece sincronizarlas primero (llama internamente al mismo flujo de `/opsx:sync`).
3. Mueve la carpeta del change a `openspec/changes/archive/YYYY-MM-DD-<nombre>/`.

---

## 5. Formato de los artefactos

### `proposal.md`
Qué se va a construir y por qué (el "qué y por qué" de negocio/producto).

### `design.md`
Decisiones técnicas de "cómo". Es condicional: se omite si el change no lo necesita (cambios triviales).

### `tasks.md`
Lista de pasos de implementación como checklist:
```markdown
- [ ] Crear endpoint POST /auth/login
- [x] Agregar validación de email
```

### Delta spec (`changes/<nombre>/specs/<capability>/spec.md`)
```markdown
## Purpose
(Solo si es una capability nueva — sirve para sembrar la main spec)

## ADDED Requirements

### Requirement: Nueva funcionalidad
El sistema DEBERÁ hacer algo nuevo.

#### Scenario: Caso básico
- **WHEN** el usuario hace X
- **THEN** el sistema hace Y

## MODIFIED Requirements

### Requirement: Funcionalidad existente
El sistema DEBERÁ seguir haciendo lo de antes, y ahora también manejar A.

#### Scenario: Escenario que la main spec ya tiene
- **WHEN** ...
- **THEN** ...

#### Scenario: Escenario nuevo a agregar
- **WHEN** ...
- **THEN** ...

## REMOVED Requirements

### Requirement: Funcionalidad obsoleta

## RENAMED Requirements

- FROM: `### Requirement: Nombre viejo`
- TO: `### Requirement: Nombre nuevo`
```

### Main spec (`openspec/specs/<capability>/spec.md`)
Es el resultado de fusionar todos los deltas a lo largo del tiempo. **Nunca contiene encabezados de operación** (`ADDED`/`MODIFIED`/etc.) — todos los requirements viven bajo una única sección `## Requirements`:
```markdown
# <Capability> Specification

## Purpose
Descripción breve de qué hace esta capability y por qué existe.

## Requirements

### Requirement: Nueva funcionalidad
El sistema DEBERÁ hacer algo nuevo.

#### Scenario: Caso básico
- **WHEN** el usuario hace X
- **THEN** el sistema hace Y
```

---

## 6. `openspec/config.yaml`

Configuración del proyecto, opcional pero recomendable llenarla a medida que crece:

```yaml
schema: spec-driven

# Contexto de proyecto que se le muestra a la IA al crear artefactos
context: |
  Tech stack: ...
  Convenciones: ...
  Dominio: ...

# Reglas específicas por tipo de artefacto
rules:
  proposal:
    - Mantener las proposals en menos de 500 palabras
  tasks:
    - Dividir tareas en bloques de máximo 2 horas

# Guías (no obligatorias) para las operaciones apply/archive
operations:
  apply:
    guidance:
      - Mantener los resúmenes de test concisos
  archive:
    guidance:
      - Resumir el resultado del archivado antes de terminar
```

Este archivo se lee automáticamente en cada flujo (`propose`, `apply`, `archive`, `explore`, etc.) y sus reglas se aplican como restricciones para el contenido generado — nunca se copian textualmente dentro de los artefactos.

---

## 7. CLI `openspec` — comandos usados por los workflows

No hace falta memorizarlos (los skills los invocan automáticamente), pero es útil reconocerlos si algo falla:

| Comando | Para qué |
|---|---|
| `openspec new change "<nombre>"` | Crea el scaffold de un change nuevo (nunca crear la carpeta a mano). |
| `openspec status --change "<nombre>" --json` | Estado de los artefactos de un change: cuáles están `ready`/`blocked`/`done`/`skipped`, y sus dependencias. |
| `openspec instructions <artifact-id> --change "<nombre>" --json` | Trae `template`, `context`, `rules`, `instruction` y `resolvedOutputPath` para generar ese artefacto. |
| `openspec list --json` | Lista los changes activos. |
| `openspec list --specs` | Lista las capabilities/main specs existentes. |
| `openspec show "<spec-id>" --type spec --json --no-scenarios` | Vista rápida de una main spec (purpose + requirements, sin escenarios). |
| `openspec validate --specs` | Valida que las main specs estén bien formadas tras un sync. |
| `openspec context --json` | Resuelve la raíz de OpenSpec del proyecto actual. |
| `openspec schemas --json` | Lista los schemas de workflow disponibles. |
| `openspec store list --json` | Lista stores externos registrados (si se trabaja contra specs fuera de este repo). |

---

## 8. Reglas de oro (guardrails transversales)

- **Planeación y código están separados.** `/opsx:propose`, `/opsx:update` y `/opsx:explore` nunca tocan código de la app. Solo `/opsx:apply` lo hace.
- **Nunca se crea un change a mano.** Siempre `openspec new change "<nombre>"`, para que se genere la metadata (`.openspec.yaml`) correctamente.
- **Las main specs no se editan directo durante una implementación.** Se editan los delta specs del change; la fusión a main specs ocurre vía `/opsx:sync` o durante `/opsx:archive`.
- **Una tarea solo se marca `[x]` si está 100% implementada** según lo que dice la spec — nunca por estar "casi lista".
- **Ambigüedad que afecta alcance, comportamiento observable, compatibilidad o criterios de aceptación → se pregunta al usuario.** Detalles menores → se asume razonablemente y se documenta.
- **`context` y `rules` del `config.yaml` son restricciones para quien genera el artefacto, no contenido a copiar** dentro del archivo final.

---

## 9. Flujo típico de ejemplo

```
Usuario: "quiero agregar login con email y password"

1. (opcional) /opsx:explore  → pensar el enfoque, ver qué ya existe
2. /opsx:propose "add-email-login"
     → crea openspec/changes/add-email-login/
         proposal.md, design.md, tasks.md, specs/auth/spec.md (delta)
3. Revisar los artefactos generados, ajustar con /opsx:update si algo no cuadra
4. /opsx:apply add-email-login
     → implementa las tasks.md una por una contra el código real
5. /opsx:sync add-email-login   (o se hace automáticamente al archivar)
     → fusiona el delta de auth/spec.md dentro de openspec/specs/auth/spec.md
6. /opsx:archive add-email-login
     → mueve todo a openspec/changes/archive/2026-09-14-add-email-login/
```

Al final, `openspec/specs/auth/spec.md` queda como la especificación vigente de esa capability, lista para servir de base al próximo change que la toque.
