# Flujo visual de OpenSpec: cómo viaja la información

Este documento complementa [METODOLOGIA-OPENSPEC.md](METODOLOGIA-OPENSPEC.md). Ahí está el "qué es cada cosa"; acá está **el recorrido**: qué información se mueve, de qué archivo a qué archivo, y en qué momento exacto.

---

## 1. El ciclo completo, de punta a punta

```
 ┌──────────────┐
 │   Tu idea     │   "quiero agregar reseteo de password"
 └──────┬───────┘
        │
        v
 ┌──────────────────────┐
 │  /opsx:explore        │   (opcional) pensar, sin escribir nada todavía
 │  solo LEE el código   │
 └──────┬────────────────┘
        │ cuando la idea está clara
        v
 ┌───────────────────────────────────────────────────────────┐
 │  /opsx:propose "add-password-reset"                        │
 │                                                              │
 │  crea openspec/changes/add-password-reset/                  │
 │        ├── proposal.md   ← qué y por qué                    │
 │        ├── specs/user-auth/spec.md  ← delta (ADDED/MODIFIED)│
 │        ├── design.md     ← cómo (si aplica)                 │
 │        └── tasks.md      ← checklist de implementación      │
 └──────┬───────────────────────────────────────────────────────┘
        │ artefactos listos, TODAVÍA no hay código nuevo
        v
 ┌───────────────────────────┐
 │  /opsx:update (opcional)   │   ajustar artefactos si algo no cuadra
 │  NUNCA toca código          │
 └──────┬──────────────────────┘
        │
        v
 ┌───────────────────────────────────────────────────────────┐
 │  /opsx:apply add-password-reset                             │
 │                                                              │
 │  lee proposal + specs(delta) + design + tasks                │
 │  por cada tarea de tasks.md:                                 │
 │     escribe código real  →  marca [x]                        │
 └──────┬───────────────────────────────────────────────────────┘
        │ código implementado, delta spec SIGUE sin fusionar
        v
 ┌───────────────────────────────────────────────────────────┐
 │  /opsx:sync add-password-reset                               │
 │                                                              │
 │  lee   changes/add-password-reset/specs/user-auth/spec.md    │
 │  edita openspec/specs/user-auth/spec.md   (LA MAIN SPEC)     │
 │  fusiona ADDED / MODIFIED / REMOVED / RENAMED                │
 └──────┬───────────────────────────────────────────────────────┘
        │ la main spec ya refleja el nuevo comportamiento
        v
 ┌───────────────────────────────────────────────────────────┐
 │  /opsx:archive add-password-reset                            │
 │                                                              │
 │  (si no corriste sync antes, te lo ofrece acá mismo)          │
 │  mueve la carpeta completa a:                                 │
 │     changes/archive/2026-09-14-add-password-reset/            │
 └───────────────────────────────────────────────────────────────┘
```

**Idea central del flujo:** la información nace como *intención* (proposal), se vuelve *contrato formal de cambio* (delta spec), se traduce a *trabajo concreto* (tasks → código), y termina fusionada como *verdad vigente* (main spec) con su historial preservado (archive).

---

## 2. El mecanismo clave: cómo el delta "encuentra" su main spec

Esto es lo que hace posible que `/opsx:sync` sepa **qué archivo de `specs/` actualizar** sin que nadie se lo diga explícitamente: ambos comparten el mismo `<capability-path>`.

```
 openspec/changes/add-password-reset/specs/user-auth/spec.md
                                      └──────┬──────┘
                                             │  mismo path = misma capability
                                             │
 openspec/specs/user-auth/spec.md   ←───────┘
```

```
 DELTA (dentro del change)                    MAIN SPEC (openspec/specs/)
 ┌─────────────────────────────┐              ┌─────────────────────────────┐
 │ ## MODIFIED Requirements      │              │ ## Requirements               │
 │                                │              │                                │
 │ ### Requirement: Login         │   /opsx:sync │ ### Requirement: Login         │
 │ ...ahora también soporta        │ ───────────> │ ...ahora también soporta        │
 │ reseteo de password             │   fusiona    │ reseteo de password             │
 │                                │              │                                │
 │ #### Scenario: Nuevo escenario │              │ #### Scenario: Nuevo escenario │
 │ - WHEN pide reset               │              │ - WHEN pide reset               │
 │ - THEN recibe email             │              │ - THEN recibe email             │
 └─────────────────────────────┘              │                                │
                                               │ (+ escenarios previos, intactos)│
                                               └─────────────────────────────┘
```

Si el delta describe una capability que **no existe todavía** en `openspec/specs/`, `/opsx:sync` la crea usando el `## Purpose` del delta como semilla del nuevo `spec.md`.

---

## 3. Estado del sistema, antes y después de cada paso

```
                       openspec/specs/          openspec/changes/
                       (verdad vigente)          (trabajo en curso)
                       ─────────────────         ──────────────────────────
 antes de propose      user-auth: v1              (nada)

 después de propose    user-auth: v1              add-password-reset/
                        (sin cambios)                proposal.md   ✓
                                                       specs/ (delta) ✓
                                                       design.md     ✓
                                                       tasks.md      ✓  (vacíos [ ])

 después de apply       user-auth: v1              add-password-reset/
                        (sin cambios todavía)         tasks.md  [x][x][x]  ← código YA existe
                                                       delta spec SIN fusionar todavía

 después de sync        user-auth: v2  ← ¡acá cambia!  add-password-reset/
                        (delta fusionado)               (queda igual, sigue activo)

 después de archive     user-auth: v2                changes/archive/
                        (sin cambios)                  2026-09-14-add-password-reset/
                                                          (todo el contenido, como registro)
```

**Punto importante:** el código puede estar 100% funcionando (post-`apply`) mientras la main spec todavía dice la versión vieja (`v1`), si no corriste `sync`. Por eso `/opsx:archive` chequea esto y te ofrece sincronizar antes de cerrar — para que nunca quede un change archivado cuya spec principal no refleje lo que realmente se implementó.

---

## 4. Por qué el change archivado conserva su `specs/` (el delta)

No se borra tras fusionar. Se mueve completo, delta incluido, a `archive/`:

```
 changes/archive/2026-08-30-add-email-login/
 ├── proposal.md          ← por qué se hizo, en su momento
 ├── tasks.md              ← qué tan completo quedó
 └── specs/
     └── user-auth/
         └── spec.md        ← EXACTAMENTE qué se le pidió cambiar a la main spec
```

Sirve como bitácora: si en seis meses alguien pregunta "¿por qué `user-auth` soporta reseteo de password?", el delta archivado es la respuesta con el detalle exacto de esa decisión — la main spec actual solo dice *qué* hace el sistema, no *cuándo ni por qué* llegó a hacerlo.

---

## 5. Rigor progresivo: por qué un change puede no tener `design.md`

`design.md` es un artefacto **condicional**, no obligatorio, dentro del schema `spec-driven`:

```
 change trivial                      change complejo
 (agregar un campo)                  (nueva arquitectura de auth)

 proposal.md   ✓                     proposal.md   ✓
 specs/        ✓                     specs/        ✓
 design.md     — (se omite)          design.md     ✓  (decisiones técnicas, trade-offs)
 tasks.md      ✓                     tasks.md      ✓
```

`/opsx:propose` decide esto automáticamente según la instrucción del schema para ese artefacto (`instruction` marca cuándo es condicional); vos también podés pedir explícitamente que se omita si el cambio no lo amerita.

---

## 6. Resumen en una línea por comando

| Comando | Mueve información... |
|---|---|
| `/opsx:explore` | Del código hacia tu cabeza (solo lectura, nada se escribe sin confirmar) |
| `/opsx:propose` | De tu idea hacia `proposal.md` / `specs/` (delta) / `design.md` / `tasks.md` |
| `/opsx:update` | Reconcilia esos mismos artefactos entre sí — nunca toca código |
| `/opsx:apply` | De `tasks.md` hacia el código real del proyecto |
| `/opsx:sync` | Del delta spec del change hacia la main spec en `openspec/specs/` |
| `/opsx:archive` | De `openspec/changes/<nombre>/` hacia `openspec/changes/archive/<fecha>-<nombre>/` |
