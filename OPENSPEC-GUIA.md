# OpenSpec — Guía de Spec-Driven Development (SDD)

> Nota de terminología: "SDD" = **Spec-Driven Development** (desarrollo guiado por especificaciones), no "software driven development". Es la metodología que implementa OpenSpec.

Repo oficial: https://github.com/Fission-AI/OpenSpec
Paquete npm: `@fission-ai/openspec`
Estado en esta carpeta: **ya instalado e inicializado** para Claude Code (ver sección 8).

---

## 1. Qué problema resuelve

Cuando le pides algo a un asistente de IA y se pone a programar directo, el riesgo es descubrir a mitad de camino (o al final) que construyó lo que **él** entendió, no lo que tú querías. SDD invierte el orden:

1. Primero acuerdan **qué** se va a construir (un spec + una lista de tareas).
2. Ambos (tú y la IA) revisan ese plan.
3. Recién ahí se escribe código.
4. Al terminar, el spec se actualiza para reflejar el nuevo estado del sistema.

El spec deja de ser documentación que se pudre con el tiempo y pasa a ser la **fuente de verdad viva** del comportamiento del sistema.

---

## 2. Filosofía (4 principios)

| Principio | Significado |
|---|---|
| **Fluido, no rígido** | No son fases obligatorias en orden fijo; puedes saltarte o reordenar pasos. |
| **Iterativo, no waterfall** | Se espera aprender y corregir sobre la marcha, no planear perfecto de una vez. |
| **Fácil, no complejo** | Mínima fricción de setup; no burocracia. |
| **Brownfield-first** | Diseñado para modificar sistemas **existentes**, no solo para proyectos desde cero. |

---

## 3. Los dos directorios clave

```
openspec/
├── specs/     ← la verdad actual: cómo se comporta el sistema HOY
└── changes/   ← propuestas de modificación, en progreso
    └── archive/  ← cambios ya completados e integrados
```

- **`specs/`**: organizado por dominio (ej. `auth/`, `payments/`, `notifications/`). Cada spec describe comportamiento observable, no implementación.
- **`changes/`**: cada carpeta es un cambio propuesto, autocontenido, que puede vivir en paralelo con otros sin pisarse.

Regla mental: **specs = presente. changes = futuro propuesto.** Cuando un change se archiva, su contenido se fusiona dentro de specs y ese "futuro" pasa a ser el nuevo "presente".

---

## 4. Anatomía de un "change" (carpeta dentro de `openspec/changes/`)

Cada cambio puede tener estos artefactos (no todos son obligatorios — "rigor progresivo": usa solo el peso que necesites):

| Artefacto | Archivo | Contenido |
|---|---|---|
| **Proposal** | `proposal.md` | La intención: por qué se hace, qué alcance tiene, enfoque general |
| **Delta Specs** | `specs/*.md` (dentro del change) | Qué cambia respecto al spec actual — ver sección 5 |
| **Design** | `design.md` | Cómo se hace técnicamente: arquitectura, decisiones, archivos afectados |
| **Tasks** | `tasks.md` | Checklist jerárquico de implementación (checkboxes) |

Orden lógico de dependencia (schema por defecto `spec-driven`):

```
proposal → specs (delta) → design → tasks
```

Pero son "habilitadores", no una secuencia forzada: puedes saltar design si el cambio es trivial, o crear specs y proposal casi en paralelo.

---

## 5. Delta Specs — la pieza más importante para "brownfield"

En vez de reescribir todo el spec de un dominio, un change solo declara **qué cambia**, con tres secciones:

```markdown
## ADDED Requirements
- Nuevo comportamiento que no existía

## MODIFIED Requirements
- Comportamiento existente que cambia

## REMOVED Requirements
- Comportamiento que se elimina
```

Ventajas:
- **Claridad**: se ve el diff de intención sin comparar documentos enteros.
- **Sin conflictos**: dos changes pueden tocar el mismo spec si afectan requisitos distintos.
- **Revisión rápida**: el reviewer lee solo lo que cambia.

Al archivar: ADDED se agrega, MODIFIED reemplaza el requisito existente, REMOVED lo borra — de forma predecible.

### Formato de un requisito (dentro de specs)

- **Purpose**: contexto del dominio.
- **Requirements**: comportamientos usando keywords RFC 2119 (**MUST, SHALL, SHOULD, MAY**) para indicar el nivel de obligación.
- **Scenarios**: ejemplos verificables en formato **Given / When / Then**.

Regla de oro para escribir specs: si puedes cambiar la implementación sin que el comportamiento visible cambie, **eso no va en el spec** (va en `design.md`).

---

## 6. Ciclo de vida completo de un change

```
1. openspec/specs/  (estado actual)
        ↓
2. Se crea un change → se proponen delta specs
        ↓
3. Se implementa el código (tasks.md se va marcando)
        ↓
4. /opsx:verify  → ¿la implementación coincide con lo planeado?
        ↓
5. /opsx:sync    → los delta specs se fusionan en los specs principales
        ↓
6. /opsx:archive → la carpeta del change se mueve a changes/archive/ con fecha
        ↓
7. openspec/specs/ ahora refleja el NUEVO comportamiento → vuelve al paso 1
```

El archivo nunca se pierde: queda en `changes/archive/` como registro histórico auditable.

---

## 7. Dos superficies de comandos (no las confundas)

| | Dónde corre | Ejemplos |
|---|---|---|
| **CLI `openspec`** | Terminal | `openspec init`, `openspec list`, `openspec validate`, `openspec archive` |
| **Slash commands `/opsx:*`** | Chat con tu asistente de IA (Claude Code) | `/opsx:propose`, `/opsx:apply` |

No hay un "modo interactivo" separado: el CLI hace scaffolding/administración; los `/opsx:*` son los que realmente conversan contigo y generan/editan los artefactos con ayuda de la IA.

### Comandos CLI útiles

```bash
openspec list [--specs|--changes]     # listar specs o changes
openspec show <item>                  # ver detalle de un spec/change
openspec validate [--all|--changes|--specs]  # chequear estructura
openspec status [--change <id>]       # progreso de un change
openspec archive [change-name]        # archivar manualmente
openspec config profile               # activar workflows extra
openspec update                       # regenerar configs tras actualizar el CLI
```

### Slash commands — flujo básico (perfil por defecto)

| Comando | Qué hace | Cuándo usarlo |
|---|---|---|
| `/opsx:explore` *(opcional)* | Pensar en voz alta una idea sin crear artefactos aún | Requisitos difusos, quieres explorar opciones |
| `/opsx:propose` | Crea el change y genera los artefactos de planeación en un paso | Feature/fix con visión clara |
| `/opsx:apply` | Implementa las tareas del change | Ya tienes el plan listo, toca programar |
| `/opsx:update` | Revisa/ajusta artefactos existentes sin empezar de cero | Cambiar specs/design a mitad de camino |
| `/opsx:sync` | Fusiona los delta specs en los specs principales | Antes de archivar |
| `/opsx:archive` | Archiva el change completado | Implementación terminada y verificada |

### Slash commands — flujo expandido (más control granular)

Se activan con `openspec config profile`.

| Comando | Qué hace |
|---|---|
| `/opsx:new` | Crea el scaffold del change manualmente |
| `/opsx:continue` | Genera el siguiente artefacto en la cadena de dependencias, uno a la vez |
| `/opsx:ff` (fast-forward) | Genera todos los artefactos de planeación de una vez |
| `/opsx:verify` | Valida que la implementación coincide con lo planeado |
| `/opsx:bulk-archive` | Archiva varios changes completados a la vez |
| `/opsx:onboard` | Tutorial interactivo usando tu propio código |

---

## 8. Patrones de flujo recomendados

```
Camino rápido (default):
  /opsx:explore (opcional) → /opsx:propose → /opsx:apply → /opsx:sync → /opsx:archive

Camino expandido (control fino):
  /opsx:new → /opsx:continue (o /opsx:ff) → /opsx:apply → /opsx:verify → /opsx:archive
```

| Patrón | Secuencia | Ideal para |
|---|---|---|
| Feature rápida | `/new → /ff → /apply → /verify → /archive` | Features/fixes chicos-medianos, tiempo ajustado |
| Exploratorio | `/explore → /new → /continue → /apply` | Optimización, debugging, requisitos ambiguos |
| Trabajo paralelo | Varios `/new` con cambio de contexto | Equipos, interrupciones urgentes |

**¿Actualizar un change existente o crear uno nuevo?**
- Actualiza (`/opsx:update`) si: refinas la ejecución, escalas de MVP hacia algo más completo, corriges por algo que aprendiste.
- Crea uno nuevo si: la intención cambió de raíz, el alcance explotó, o es un trabajo independiente del original.

---

## 9. Lo que ya está instalado en ESTA carpeta

```
SSD/
├── openspec/
│   ├── config.yaml          ← schema activo: "spec-driven"
│   ├── specs/                ← vacío por ahora (.gitkeep)
│   └── changes/
│       └── archive/          ← vacío por ahora (.gitkeep)
└── .claude/
    ├── commands/opsx/        ← apply, archive, explore, propose, sync, update
    └── skills/               ← una skill de Claude Code por cada comando
```

Perfil activo: **core** (6 comandos). Los 6 comandos del flujo expandido (`new`, `continue`, `ff`, `verify`, `bulk-archive`, `onboard`) están disponibles pero no instalados — se agregan con:

```bash
openspec config profile
```

Nota: esta carpeta **todavía no es un repo git** (`git init` pendiente). Como OpenSpec asume que trabajas con control de versiones (los changes viven como carpetas que luego se archivan/mergean), vale la pena inicializar git antes de tu primer change real.

---

## 10. Primeros pasos prácticos

1. (Recomendado) Inicializa git en esta carpeta.
2. En el chat de Claude Code, corre:
   ```
   /opsx:propose "descripción de tu primera idea/feature"
   ```
3. Revisa el `proposal.md` y los delta specs que genera — este es el momento de corregir el rumbo, **antes** de que se escriba código.
4. Corre `/opsx:apply` para que implemente las tareas.
5. Corre `/opsx:verify` (si quieres doble chequeo) y luego `/opsx:sync` + `/opsx:archive`.
6. Repite. Con el tiempo, `openspec/specs/` se convierte en la documentación viva y confiable de tu sistema.

Alternativa para aprender sin arriesgar nada: `/opsx:onboard` — es un tutorial guiado sobre tu propio código.

---

## 11. Buenas prácticas al escribir specs

- Describe **comportamiento observable**, nunca detalles de implementación, librerías o estructura interna del código.
- Usa **Given/When/Then** para cada escenario — deben ser verificables (casi como criterios de aceptación de QA).
- Usa las keywords RFC 2119 con intención: `MUST` (obligatorio), `SHOULD` (recomendado, con excepciones justificables), `MAY` (opcional).
- Rigor progresivo: la mayoría de los changes solo necesitan un "lite-spec". Sube el nivel de detalle solo en cambios cross-team, cambios de API pública, migraciones, o algo crítico de seguridad.

---

## 12. Glosario rápido

| Término | Significado |
|---|---|
| **Spec** | Documento que describe el comportamiento actual y verificado de una parte del sistema |
| **Change** | Carpeta autocontenida con la propuesta de una modificación, aún no integrada |
| **Delta spec** | La parte de un change que dice qué se agrega/modifica/quita respecto al spec actual |
| **Proposal** | El "por qué" y el alcance de un change |
| **Design** | El "cómo" técnico de un change |
| **Tasks** | El checklist de implementación de un change |
| **Archive** | Proceso de fusionar un change terminado dentro de los specs principales y moverlo a `changes/archive/` |
| **Schema** | Define qué artefactos existen y sus dependencias (por defecto: `spec-driven`) |
| **Profile** | Conjunto de comandos/workflows activados (`core` vs expandido) |

---

## 13. Recursos

- Repo: https://github.com/Fission-AI/OpenSpec
- Docs completas: https://github.com/Fission-AI/OpenSpec/tree/main/docs
- Comandos slash en detalle: `docs/commands.md`
- CLI en detalle: `docs/cli.md`
- Cómo escribir buenos specs: `docs/writing-good-specs.md`
- Tutorial interactivo: `/opsx:onboard` (dentro de Claude Code, en este proyecto)
