# AI/ARCHITECTURE_BLUEPRINT_SUPABASE.md: PROTOCOLO OMEGA (Plantacora)

## 1. FILOSOFÍA DE LA ARMADURA
Next.js en este hangar no es un framework de frontend; es una plataforma de ingeniería full-stack. La regla de oro es la **Separación de Preocupaciones (SoC)** y la **Eficiencia de Datos**.

* **src/app**: Pura infraestructura de ruteo, layouts y orquestación (HUD).
* **src/core**: El reactor. Aquí vive la verdad del negocio (Dominio), independiente del framework.
* **src/components**: Piezas intercambiables de la interfaz.
* **src/lib**: Clientes de infraestructura (Supabase, PDF, Utils).

## 2. EL LÍMITE DE LA FRONTERA (RSC VS. CLIENT)
La gestión de la frontera de hidratación es crítica para reducir el bundle size y las consultas innecesarias.

### Server Components (RSC) - Por Defecto
* **Uso**: Fetching de datos (queries), acceso directo a Supabase via Server Client, lógica de negocio pesada.
* **Rendimiento**: Carga de datos en el servidor para evitar "waterfalls" de red en el cliente. El código de estas funciones nunca viaja al navegador.

### Client Components - La Excepción
* **Uso**: Event listeners (`onClick`), Hooks de React, interactividad compleja (Resizer lateral).
* **Regla**: Deben llevar `"use client"` y ser lo más pequeños posible (Islas de Interactividad).

## 3. DOMAIN DRIVEN DESIGN (DDD) EN `src/core`
Jarvis no permitirá lógica de negocio fuera de `src/core`. Se organiza por módulos:

* **Domain**: Entidades puras y contratos. `Plant.ts` define qué es una planta; `PlantRepository.ts` define la interfaz de interacción.
* **Application**: Casos de uso como `RegisterWatering.ts`. Orquestan la acción sin conocer la infraestructura.
* **Infrastructure**: Implementaciones técnicas como `SupabasePlantRepository.ts`.

## 4. FLUJO DE DATOS Y RENDIMIENTO (ELIMINACIÓN DE CARGA MASIVA)

### Lectura (Queries & Caching)
* **RSC Queries**: Las lecturas se hacen en componentes de servidor. Se utiliza el cache de Next.js para evitar consultas repetitivas a Supabase en el mismo ciclo de renderizado.
* **Data Revalidation**: Se usan tags de caché para invalidar solo los datos necesarios cuando ocurre una mutación.

### Escritura (Server Actions & Partial Refresh)
* **Server Actions**: Todas las mutaciones (riego, abono, etc.) se ejecutan aquí.
* **Partial Refresh**: Tras una mutación, se utiliza `revalidatePath('/dashboard/plants')` o `revalidateTag()`. Esto instruye a Next.js a actualizar solo los datos de esa ruta en el servidor y enviar el parche al cliente, actualizando la UI sin recargar la página completa.
* **router.refresh()**: En componentes cliente, se invoca para sincronizar el estado del servidor tras acciones asíncronas, manteniendo la coherencia sin perder el estado local.

## 5. ESTADO Y COMUNICACIÓN (NANO STORES)
Evitamos el Context API pesado que causa re-renders masivos en todo el árbol de componentes.

* **Nano Stores**: Ubicadas en `src/store/`. Se utilizan para estado efímero del cliente (ej. `isResizing`, `activeModal`).
* **Desacoplamiento**: Los componentes se suscriben a átomos específicos. Un cambio en el `modalStore` no afecta el renderizado de la lista de plantas, optimizando los ciclos de CPU del cliente.
* **URL State**: Filtros y pestañas se manejan vía URL Search Params. Esto permite persistencia nativa y reduce la necesidad de mantener estado complejo en memoria.

## 6. SEGURIDAD Y FIREWALL
* **Middleware**: Guardián en `src/middleware.ts`. Verifica la sesión de Supabase antes de permitir el acceso.
* **Zod Validation**: Uso obligatorio en la entrada de cada Server Action. Ningún dato toca el dominio sin validación.
* **Database Policies (RLS)**: La seguridad final reside en la base de datos. Las políticas de Supabase garantizan que ningún usuario pueda operar sobre datos ajenos, incluso si el frontend es comprometido.

## 7. SCRIPTS Y REPORTES
* **v4_migrator.ts**: Script encargado de la transición del JSON local a PostgreSQL.
* **JsPdf Reporting**: Generación de reportes PDF en el cliente para reducir carga de procesamiento en el servidor.

## 8. REGLAS DE ORO DE DESARROLLO
* **Never Build after changes**: Verifica lógica y tipos antes de cualquier build.
* **Conventional Commits**: Obligatorio.
* **No AI Attribution**: Jarvis entrega resultados, no reclama créditos.
* **Stop & Wait**: Si un componente mezcla lógica de persistencia con manejo de DOM, detente y refactoriza siguiendo DDD.