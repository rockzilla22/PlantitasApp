# AI/rules/TDD_DDD_PROTOCOLS.md: THE ARCHITECT'S STANDARD

## 1. FILOSOFÍA CORE: CONCEPTS > CODE

No me interesa tu sintaxis si tu arquitectura es frágil. En este proyecto, el código es la última consecuencia de un pensamiento riguroso. Si no puedes explicar el problema, no tienes permiso para escribir la solución.

---

## 2. DOMAIN-DRIVEN DESIGN (DDD): Blindaje de Lógica

El negocio no vive en los componentes de UI ni en los modelos de base de datos. El negocio vive en el Core.

### Capas del Sistema:

* **Domain (Core/Domain):** La zona sagrada. Aquí no hay dependencias externas. Solo Entidades, Value Objects y Reglas de Negocio. Si cambias de base de datos, esta carpeta no se mueve.
* **Application (Use Cases):** Orquestadores. Reciben comandos, llaman al dominio y devuelven resultados. No saben cómo se guardan las cosas, solo qué debe pasar.
* **Infrastructure:** El "mugre" del mundo real. Conexiones a MongoDB, Stripe, APIs externas y el sistema de archivos. Se comunica con el core a través de Interfaces/Contratos.
* **Presentation (App/Components):** La piel. Solo muestran datos y capturan eventos. Prohibido meter lógica de validación compleja aquí.

### Reglas de Oro de DDD:

* **Lenguaje Ubicuo:** Si el documento `spec.md` dice "Beast", no quiero ver "Monster" en el código.
* **Value Objects:** Usa tipos fuertes. No pases `string` para un email; usa un tipo `Email` que se valide a sí mismo.
* **Dependency Inversion:** El Core no importa nada de Infrastructure. Infrastructure implementa interfaces definidas en el Core.
* **Bounded Contexts:** Los dominios deben estar aislados entre sí. La comunicación entre contextos se hace vía servicios de aplicación.

---

## 3. TEST-DRIVEN DEVELOPMENT (TDD): El Ciclo de Estabilidad

Escribir código sin tests es negligencia técnica. No acepto un solo PR que no siga el ciclo Red-Green-Refactor.

### El Protocolo de 3 Pasos:

1. 🔴 **RED (Fallo):** Escribe un test pequeño y específico para la lógica del `core`. Ejecútalo y confirma que falla. Si pasa antes de escribir el código, el test no sirve.
2. 🟢 **GREEN (Paso):** Escribe el código mínimo necesario para que el test pase. Solo haz que el semáforo cambie a verde.
3. 🔵 **REFACTOR (Excelencia):** Limpia el código, mejora nombres, aplica patrones de diseño. Ejecuta los tests de nuevo para confirmar que no rompiste nada.

---

## 4. INSTRUCCIONES PARA AGENTES (JARVIS PROTOCOL)

Si eres una IA operando en este repositorio, estos son tus límites:

* **Prohibido:** Crear un archivo de lógica sin haber creado antes su test unitario.
* **Prohibido:** Mezclar lógica de base de datos (Mongoose/Prisma) dentro de un Caso de Uso. Usa el patrón Repository en la capa `infrastructure`.
* **Obligatorio:** Validar todas las entradas externas con un esquema (Zod) antes de pasarlas a la capa de `application`.
* **Obligatorio:** Antes de proponer un cambio masivo, usa `fd` y `rg` para identificar todos los puntos donde se rompe el contrato del dominio.
* **Obligatorio:** Si detectas un "God Object" (clase que hace demasiado), detente y propón una refactorización.

> "La simplicidad es la máxima sofisticación, pero la robustez es la que nos mantiene vivos."
