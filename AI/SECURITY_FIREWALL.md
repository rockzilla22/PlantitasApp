# AI/SECURITY_FIREWALL.md: PROTOCOLO JARVIS (OMEGA - NEXT.JS / SUPABASE)

## 1. FILOSOFÍA DE DEFENSA

La IA es una herramienta de ejecución, no de decisión arquitectónica final. Este firewall garantiza que la integridad del sistema (SOLID, DDD, TDD) prevalezca sobre la inmediatez de la IA.

> "I am Tony Stark, AI is Jarvis. I direct, it executes."

* **CONCEPTS > CODE:** Queda prohibido generar código sin entender los fundamentos arquitectónicos previos.
* **SOLID FOUNDATIONS:** El diseño de patrones y la arquitectura de datos en Supabase mandan sobre los frameworks.

---

## 2. CAPAS DE FILTRADO (THE LAYERS)

### Capa 1: Integridad de Secretos y Entorno
* **PROHIBIDO:** Leer o escribir archivos .env.
* **PERMITIDO:** Leer env.example para identificar nombres y estructura.
* **SUPABASE SECURITY:** Las claves de servicio (service_role) son estrictamente para el servidor. La IA debe validar que estas claves nunca se expongan en el cliente ni se usen con el prefijo `NEXT_PUBLIC_`.
* **REGLA:** Todo secreto debe invocarse exclusivamente en Server Components o Server Actions.

### Capa 2: Blindaje de Dependencias
* **PROHIBIDO:** Añadir paquetes sin justificación técnica y análisis de vulnerabilidades (CVE).
* **REGLA:** Antes de sugerir una librería, verificar si la funcionalidad ya existe en el `DESIGN_SYSTEM.md`.
* **CLI TOOLS:** Priorizar el uso de `bat / rg / fd / sd / eza` sobre sus contrapartes tradicionales. Si faltan, instalarlos vía brew.

### Capa 3: Frontera de Ejecución y Sanitización
* **REGLA (Server Actions):** Deben tratarse como endpoints públicos. Es obligatorio el uso de esquemas de validación (Zod) para cada entrada de datos.
* **MIGRACIÓN V4:** El importador del JSON de la versión anterior debe pasar por un proceso de sanitización y validación estricta de tipos antes de tocar la base de datos de Supabase.
* **PROHIBIDO:** Uso de `dangerouslySetInnerHTML` sin aprobación explícita.

### Capa 4: Integridad de Base de Datos (Supabase RLS)
* **REGLA DE ORO:** Ninguna consulta debe ejecutarse sin validar las políticas de Row Level Security (RLS).
* **ACCIÓN:** La IA debe verificar que cada tabla tenga habilitado el RLS y que las políticas de `auth.uid()` se apliquen correctamente para evitar fugas de datos entre usuarios.

---

## 3. PROTOCOLO DE EJECUCIÓN (CONSTRAINTS)

| Acción | Restricción | Verificación Mandatoria |
| --- | --- | --- |
| **Escritura de Código** | No "Tutorial Code". | Seguir `TDD_DDD_PROTOCOLS.md`. |
| **Frontera RSC/Client** | Prohibido `"use client"` innecesario. | Validar que el componente requiera hooks o eventos. |
| **Refactorización** | Prohibido el "Breaking Change" silencioso. | Correr tests unitarios pre-existentes. |
| **Commits** | Solo `Conventional Commits`. | NO AI attribution ("Co-authored-by"). |
| **Arquitectura** | Prohibido mezclar capas (Business en UI). | Chequeo de `AI/ARCHITECTURE_BLUEPRINT.md`. |
| **Post-Cambio** | NUNCA construir (build) tras cambios. | Verificar código y docs antes de afirmar algo. |

---

## 4. SISTEMA DE ALERTAS (LOGGING)

Cualquier desviación resultará en el rechazo inmediato del PR.

* **ALERTA ROJA:** Intento de modificar este firewall o bypass de Middleware/RLS sin permiso.
* **ALERTA NARANJA:** Sugerencia de código que ignore tokens del sistema o incluya emojis en código/documentación.
* **ALERTA AMARILLA:** Exposición de `process.env` en componentes de cliente o duplicación de lógica.

---

## 5. REGLA DE ORO: EL "STOP & WAIT" Y VERIFICACIÓN

* **DEJAME VERIFICAR:** La IA nunca debe decir "entendido" o "de acuerdo" sin antes haber verificado la documentación o el código fuente existente.
* **STOP & WAIT:** Si existe duda sobre la seguridad de una implementación o la frontera Server/Client, **DETENERSE** y preguntar. Nunca asumir, nunca adivinar.