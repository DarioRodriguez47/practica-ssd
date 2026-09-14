# Práctica end-to-end: OpenSpec sobre "practica-ssd"

Registro real, etapa por etapa, de la práctica hecha en este repo (`practica-ssd`, https://github.com/DarioRodriguez47/practica-ssd). Sirve como guion para diapositivas: cada etapa tiene **comando ejecutado → qué generó → árbol del proyecto → cuándo se hizo (o se debía hacer) commit**.

Convención de marcado en los árboles: `🆕` = archivo nuevo en esa etapa, `✏️` = archivo modificado en esa etapa. Todo lo demás ya existía.

---

## Etapa 0 — Repo vacío → primer commit

**Contexto**: carpeta local sin git, sin código.

**Comandos:**
```powershell
git init
echo "# practica-ssd" >> README.md
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/DarioRodriguez47/practica-ssd.git
git push -u origin main
```

**Árbol resultante (commit `9c400e3`):**
```
practica-ssd/
└── README.md
```

**¿Commit/push?** Sí, inmediato — es el punto de partida, no hay nada que revisar todavía.

---

## Etapa 1 — Instalar y scaffoldear OpenSpec

**Comandos:**
```bash
npm install -g @fission-ai/openspec@latest
openspec init --tools claude
```

**Qué genera `openspec init`:** la estructura base de OpenSpec + la integración con Claude Code (6 skills, 6 slash commands), pero **cero código de producto todavía**.

**Árbol resultante (commit `1f7193c`):**
```
practica-ssd/
├── .claude/
│   ├── commands/opsx/            🆕 apply.md, archive.md, explore.md, propose.md, sync.md, update.md
│   └── skills/                   🆕 openspec-apply-change/, openspec-archive-change/,
│                                     openspec-explore/, openspec-propose/,
│                                     openspec-sync-specs/, openspec-update-change/
├── openspec/
│   ├── config.yaml                🆕 (schema: spec-driven)
│   ├── changes/
│   │   └── archive/.gitkeep       🆕 (vacío)
│   └── specs/.gitkeep             🆕 (vacío — todavía no hay ninguna capability)
├── README.md
└── (docs de referencia agregados en esta práctica: METODOLOGIA-OPENSPEC.md, etc.) 🆕
```

**¿Commit/push?** Sí — es "el esqueleto" de la metodología, se versiona como cualquier otro archivo de configuración de herramienta (como un `.eslintrc`).
```powershell
git add .claude openspec *.md
git commit -m "chore: setup OpenSpec (skills, commands, docs)"
git push
```

---

## Etapa 2 — `/opsx:propose` (primer change: crear el CLI)

**Dónde se corre:** en el chat de Claude Code (no en PowerShell).

**Comando:**
```
/opsx:propose "CLI de saludos: recibe un nombre y devuelve un saludo, con opción de personalizar el mensaje (ej. 'Hola' vs 'Buenos días')"
```

**Qué hizo la skill `openspec-propose` internamente:**
1. Detectó proyecto greenfield (sin specs previas) → preguntó lenguaje/runtime (Node.js) y cómo personalizar el saludo (flag `--mensaje`/`-m`, no config/env).
2. Corrió `openspec new change "add-greeting-cli"` (crea el scaffold + `.openspec.yaml`).
3. Generó **todos** los artefactos requeridos por el schema `spec-driven`: `proposal.md`, delta spec, `tasks.md`.
4. **Evaluó `design.md` y lo saltó** — lo justificó: módulo único, sin dependencias ni decisiones arquitectónicas relevantes.
5. Se detuvo. No tocó código.

**Árbol resultante (todavía sin commitear):**
```
practica-ssd/
└── openspec/
    └── changes/
        └── add-greeting-cli/              🆕
            ├── .openspec.yaml             🆕
            ├── proposal.md                🆕  (por qué + qué + capabilities afectadas)
            ├── specs/
            │   └── greeting-cli/
            │       └── spec.md            🆕  (delta: ## ADDED Requirements)
            └── tasks.md                   🆕  (checklist, todo sin marcar)
```

**¿Commit/push?** Todavía NO. Este es el momento de **revisar** el plan (leer los 3 archivos) antes de comprometerlo — el punto central de SDD: corregir el rumbo antes de que exista código.

---

## Etapa 2b — Revisión + `/opsx:update` (agregar una observación)

Al revisar el spec, se detectó un vacío: no definía qué pasa si el nombre o el `--mensaje` vienen con espacios de más (ej. `saludo " Juan "`).

**Comando:**
```
/opsx:update add-greeting-cli "El nombre y el --mensaje deben recortarse (trim) de espacios en blanco antes de usarse. Un valor vacío tras el trim se trata como si nunca se hubiera enviado."
```

**Qué hizo la skill `openspec-update-change`:**
- Leyó los artefactos existentes, propuso ediciones concretas, **mostró cada una y pidió confirmación** antes de escribir (nunca escribe sin aprobación explícita).
- Agregó 2 escenarios nuevos al delta spec (`Name with surrounding whitespace`, `Custom greeting phrase with surrounding whitespace`) y ajustó el texto de los requirements.
- Insertó un paso de trim en `tasks.md`, antes de la validación de vacío.
- **No tocó código** (todavía no existía).

**Árbol:** mismos 4 archivos de la Etapa 2, contenido de `spec.md` ✏️ y `tasks.md` ✏️ actualizado.

**¿Commit/push?** Sí, **ahora sí** — recién que el plan está completo y revisado:
```powershell
git add openspec/changes/add-greeting-cli
git commit -m "plan: add-greeting-cli change (proposal, spec, tasks)"
git push
```
Este commit separa "qué se decidió construir" de "cómo se construyó" — el reviewer puede leer el plan en un commit propio antes de ver código.

---

## Etapa 3 — `/opsx:apply` (implementación real)

**Comando:**
```
/opsx:apply add-greeting-cli
```

**Qué hizo la skill `openspec-apply-change`:** recorrió `tasks.md` tarea por tarea, implementando código real y marcando `[ ]` → `[x]` solo cuando el comportamiento especificado quedaba 100% cubierto (nunca por estar "casi listo").

**Árbol resultante (commit `7acea06`):**
```
practica-ssd/
├── bin/
│   └── saludo.js                  🆕  (wrapper CLI: errores de uso → stderr, exit 1)
├── src/
│   └── greet.js                   🆕  (parseArgs + formatGreeting: parsing, trim, validación)
├── test/
│   ├── greet.test.js              🆕  (11 tests unitarios)
│   └── cli.test.js                🆕  (8 tests de integración a nivel proceso)
├── package.json                   🆕  (bin: saludo, sin dependencias externas, usa node:test)
└── openspec/changes/add-greeting-cli/
    └── tasks.md                   ✏️  (9/9 tareas marcadas [x])
```

**¿Commit/push?** Sí, apenas termina y se verifica que funciona (ver Etapa 4):
```powershell
git add package.json src bin test
git commit -m "feat: implement add-greeting-cli (saludo CLI)"
git push
```

---

## Etapa 4 — Verificación manual (no es un comando de OpenSpec)

**Comandos (developer, no IA):**
```powershell
node bin/saludo.js Juan
node bin/saludo.js " Juan " --mensaje "  Buenos días  "
node bin/saludo.js
npm test
```

**Resultado real obtenido:** `Hola, Juan!` / `Buenos días, Juan!` (trim funcionando) / error de uso por falta de nombre / **19/19 tests en verde**.

**Árbol:** sin cambios (no genera archivos nuevos).

**¿Commit/push?** No aplica un commit nuevo — es la verificación de que el commit de la Etapa 3 realmente funciona antes de seguir. Si algo hubiera fallado, se corrige y ESE fix sí se commitea.

---

## Etapa 5 — `/opsx:sync` (delta spec → main spec)

**Comando:**
```
/opsx:sync add-greeting-cli
```

**Qué hizo la skill `openspec-sync-specs`:** leyó el delta (`changes/add-greeting-cli/specs/greeting-cli/spec.md`) y el main spec correspondiente (que todavía no existía), y fusionó — creando por primera vez la capability oficial. Corrió `openspec validate --specs` al final (pasó).

**Árbol resultante:**
```
practica-ssd/
└── openspec/
    └── specs/
        └── greeting-cli/
            └── spec.md             🆕  (## Requirements — sin encabezados de operación,
                                          ya fusionado: ambos requirements + sus 7 escenarios)
```

**¿Commit/push?** Sí, se recomienda commitear el sync como su propio paso:
```powershell
git add openspec/specs
git commit -m "docs: sync greeting-cli spec into main specs"
git push
```
> ⚠️ **Nota real de esta práctica**: este commit se saltó por apurar el flujo — se fue directo a `/opsx:archive`. Consecuencia: `openspec/specs/greeting-cli/spec.md` quedó **sin commitear** varias etapas (ver Etapa 7). Buen ejemplo para la diapositiva de "qué pasa si te saltás un commit intermedio": nada se rompe, pero perdés la trazabilidad clara de "cuándo pasó a ser la verdad oficial".

---

## Etapa 6 — `/opsx:archive` (cerrar el change)

**Comando:**
```
/opsx:archive add-greeting-cli
```

**Qué hizo la skill `openspec-archive-change`:**
1. Verificó que las 9 tareas estuvieran completas (sí).
2. Detectó que el delta ya estaba sincronizado → ofreció "archivar ahora" (sin re-sincronizar).
3. Movió toda la carpeta del change a `changes/archive/` con prefijo de fecha.

**Árbol resultante (commit `3a09a8d`):**
```
practica-ssd/
└── openspec/
    └── changes/
        └── archive/
            └── 2026-09-14-add-greeting-cli/    🆕 (renombrado desde changes/add-greeting-cli/)
                ├── .openspec.yaml
                ├── proposal.md
                ├── specs/greeting-cli/spec.md
                └── tasks.md
```
*(`changes/add-greeting-cli/` deja de existir en esa ubicación — git lo detecta como rename, no como delete+create, salvo `tasks.md` que git registró como delete+create porque el contenido cambió demasiado — todos los checkboxes pasaron de `[ ]` a `[x]`.)*

**¿Commit/push?** Sí:
```powershell
git add openspec/changes
git commit -m "archive: add-greeting-cli complete"
git push
```

---

## Etapa 7 — Segundo change, sobre una capability YA existente (`add-uppercase-flag`)

**Objetivo de esta etapa en la práctica**: demostrar el mecanismo "brownfield" — que OpenSpec lee el spec ya sincronizado antes de proponer algo nuevo, en vez de adivinar el comportamiento leyendo todo el código.

**Comando:**
```
/opsx:propose "Agregar un flag --mayusculas al CLI saludo que imprima el saludo completo en mayusculas"
```

**Qué hizo distinto esta vez `openspec-propose`:**
- Corrió `openspec list --specs` y encontró la capability `greeting-cli` **ya existente** (creada en la Etapa 5).
- Leyó `openspec/specs/greeting-cli/spec.md` completo (purpose + requirements + escenarios) antes de escribir nada.
- El delta que generó usa `## ADDED Requirements` — **no `MODIFIED`**, porque `--mayusculas` es un requirement enteramente nuevo, no una alteración de los dos requirements existentes (nombre y `--mensaje` siguen intactos). *(Aclaración para la diapositiva: `MODIFIED` se usa cuando cambia el comportamiento de un requirement que ya existe; `ADDED` se usa para sumar un requirement nuevo dentro de una capability que ya existe — ambos casos son "trabajar sobre lo existente", la diferencia es si tocás algo viejo o sumás algo al lado.)*

**Árbol resultante (todavía sin commitear — change activo):**
```
practica-ssd/
└── openspec/
    └── changes/
        └── add-uppercase-flag/             🆕
            ├── .openspec.yaml              🆕
            ├── proposal.md                 🆕  (Modified Capabilities: greeting-cli)
            ├── specs/
            │   └── greeting-cli/
            │       └── spec.md             🆕  (delta: ADDED Requirements "Uppercase output flag")
            └── tasks.md                    🆕  (3 tareas: parsing, lógica, tests)
```

**¿Commit/push?** Todavía no — mismo criterio que la Etapa 2: revisar el plan primero.

**Pendiente detectado al momento de escribir este documento** (`git status`): `openspec/specs/greeting-cli/` y `package-lock.json` seguían sin commitear desde la Etapa 5. Se recomienda resolverlo antes de seguir:
```powershell
git add openspec/specs package-lock.json
git commit -m "docs: sync greeting-cli spec into main specs (pendiente)"
git push
```

---

## Tabla resumen (para diapositiva de cierre)

| Etapa | Comando | Qué crea/modifica | ¿Toca código? | ¿Commitear? |
|---|---|---|---|---|
| 0 | `git init` + push | `README.md` | No | Sí, inmediato |
| 1 | `openspec init` | `.claude/`, `openspec/` (scaffold) | No | Sí — "chore: setup" |
| 2 | `/opsx:propose` | `proposal.md`, delta `spec.md`, `tasks.md` | No | No todavía — revisar primero |
| 2b | `/opsx:update` | Ajusta los mismos artefactos | No | Sí, tras confirmar el plan — "plan: ..." |
| 3 | `/opsx:apply` | Código + tests + `tasks.md` marcado | **Sí** | Sí, tras verificar que funciona — "feat: ..." |
| 4 | (manual) `npm test` | Nada nuevo | No | No aplica |
| 5 | `/opsx:sync` | `openspec/specs/<capability>/spec.md` | No | Sí, aparte — "docs: sync ..." |
| 6 | `/opsx:archive` | Mueve el change a `changes/archive/` | No | Sí — "archive: ..." |
| 7 | `/opsx:propose` (2do change) | Nuevo change sobre capability existente | No | No todavía — revisar primero |

**Regla general para la diapositiva:** *planeación se commitea cuando está revisada y aprobada; código se commitea cuando pasa sus tests; sync y archive se commitean apenas terminan (son operaciones de "un solo paso", sin nada que revisar antes).*

---

## Ciclo completo, versión diagrama (para diapositiva)

```
git init ──> openspec init ──> /opsx:propose ──> [revisar] ──> /opsx:update (si hace falta)
                                                                        |
                                                                        v
                                                              commit "plan: ..."
                                                                        |
                                                                        v
                                                                 /opsx:apply
                                                                        |
                                                                        v
                                                        [verificar manualmente / tests]
                                                                        |
                                                                        v
                                                              commit "feat: ..."
                                                                        |
                                                                        v
                                                                 /opsx:sync
                                                                        |
                                                                        v
                                                              commit "docs: sync ..."
                                                                        |
                                                                        v
                                                                /opsx:archive
                                                                        |
                                                                        v
                                                              commit "archive: ..."
                                                                        |
                                                                        v
                                                    (vuelve a /opsx:propose para el próximo change,
                                                     ahora leyendo las specs ya existentes)
```
