# AI/specs/FEATURES_INDEX.md: PROTOCOLO OMEGA (PLANTITASAPP V5)

## 1. VISIÓN DEL SISTEMA (The "Big Picture")

* **Nombre del Proyecto:** `PlantitasApp_v5_Omega`
* **Objetivo Primario:** Gestión botánica profesional con sincronización en la nube, integridad referencial y reportes avanzados.
* **Stack Tecnológico:** `Next.js 15+ (App Router) + Tailwind v4 + Nano Stores + Supabase (Postgres) + Zod + jsPDF`.
* **Estado de Infraestructura:** `MIGRATION / DEVELOPMENT`.

---

## 2. ATLAS DE RUTAS (Engineering Entry Points)

Protocolo de navegación para agentes. Prohibido el desvío de esta estructura:

* **EL REACTOR (Business Logic):** `./src/core/plant/` -> Capas de Domain, Application e Infrastructure (Supabase Repository).
* **EL HUD (Infrastructure/Routes):** `./src/app/dashboard/` -> Orquestación de la grilla de plantas y panel de detalle.
* **COMPONENTES DE SISTEMA:** `./src/components/` -> Islas de interactividad (Resizer, Search, Form Modals).
* **ESTADO GLOBAL:** `./src/store/` -> Nano Stores para UI state (tab selection, resizer position) y caché efímera.
* **MIGRACIÓN Y SCRIPTING:** `./scripts/` -> v4_migrator.ts para la ingesta de JSON local.

---

## 3. ROADMAP ESTRATÉGICO (Feature Tracking)
Existe una versión preview funcional como localhost y json storage en
    ./PlantitasApp Original
Estos archivos son la base para todas las Features ya que esto funciona perfectamente.

| ID | Feature | Prioridad | Estado | Ubicación Principal |
| --- | --- | --- | --- | --- |
| **F-101** | **Core Botanical Engine (DDD)** | `CRITICAL` | `PENDING` | `src/core/plant/` |
| **F-102** | **Cloud Sync & RLS (Supabase)** | `CRITICAL` | `PENDING` | `src/lib/supabase/` |
| **F-103** | **Propagación** | `HIGH` | `PENDING` | `src/app/dashboard/nursery/` |
| **F-104** | **Inventario Pro (Cross-Check)** | `HIGH` | `PENDING` | `src/app/dashboard/inventory/` |
| **F-105** | **Importador de Datos v4** | `CRITICAL` | `PENDING` | `scripts/v4_migrator.ts` |
| **F-106** | **Sistema de Reportes PDF** | `MEDIUM` | `PENDING` | `src/lib/reports/` |

---

## 4. ESPECIFICACIONES TÉCNICAS (The Contract)

### [F-101] - Core Botanical Engine (DDD)

* **Definición del Problema:** Transición de un esquema plano de LocalStorage a una base de datos relacional robusta.
* **Impacto en el Dominio:** Definición de entidades (Plant, Log, Propagation) con validación estricta de tipos.
* **Detalles de Implementación:**
    * Uso de **Zod** para validar cada entrada de datos en Server Actions.
    * Lógica de cálculo automático para `lastWateredDate` basada en el historial de logs.
    * Soporte para microclimas (Luz, Ubicación, Maceta, Dormancia).

### [F-103] - Propagación (La Guardería)

* **Definición del Problema:** Seguimiento de esquejes y semillas con flujo de graduación a planta adulta.
* **Detalles de Implementación:**
    * Estados: Activo, Éxito, Fracaso, Trasplantada.
    * Lógica de herencia de IDs para vincular hijos con la planta madre.
    * Integración con Nano Stores para filtrado reactivo en la vista de guardería.

### [F-104] - Inventario Pro con Validación Cruzada

* **Definición del Problema:** Evitar el registro de acciones (fertilización, medicinas) si no hay stock disponible en el inventario.
* **Detalles de Implementación:**
    * Categorías: substrates, fertilizers, powders, liquids, meds, others.
    * Notificación de stock vacío con redirección inteligente al panel de compra.
    * Gestión de cantidades decimales y unidades estandarizadas (Kg, L, g, u.).

---

## 5. JARVIS PROTOCOL: Reglas de Ejecución (Omega)

1. **RSC First:** Toda la lectura de datos de Supabase ocurre en Server Components. Prohibido el fetching en el cliente para el dashboard inicial.
2. **Partial Refresh:** Tras cualquier mutación en un Server Action, se ejecuta `revalidatePath` para actualizar la UI sin perder el estado del cliente.
3. **Respeto al RLS:** Queda terminantemente prohibido realizar consultas que no incluyan el filtro de `user_id` de la sesión activa de Supabase.
4. **Clean Code (DDD):** Los componentes de UI solo consumen casos de uso. La lógica de SQL o llamadas a la API de Supabase vive exclusivamente en la capa de Infrastructure.
5. **No AI Attribution:** Sigue el protocolo de commits convencionales. Sin agradecimientos, solo código verificado.