# AI/specs/CAP.md: LÍMITES DE PLANES (CAPS) - PLANTITASAPP V5

Este documento especifica los límites de capacidad (caps) para cada nivel de plan en PlantitasApp, basándose en la configuración definida en `src/data/configProject.ts`.

## 1. VISIÓN GENERAL

Los caps en PlantitasApp limitan el número total de elementos que un usuario puede tener almacenados en su cuenta. Estos límites se aplican a la **suma de todos los elementos** en las siguientes categorías:

- **Plantas** (`src/core/plant/domain/Plant.ts`)
- **Propagaciones** (`src/core/nursery/domain/Propagation.ts`) 
- **Inventario** (`src/core/inventory/domain/InventoryItem.ts`) - todas las categorías
- **Notas Globales** (`src/core/notes/domain/GlobalNote.ts`)
- **Lista de Deseos** (`src/core/wishlist/domain/WishlistItem.ts`)
- **Tareas Estacionales** (`src/core/season/domain/SeasonTask.ts`)

Cada plan define un valor `maxSlots` que representa el límite máximo de elementos totales permitidos.

## 2. ESPECIFICACIONES POR PLAN

### 2.1 SIN CUENTA (NONE/NoAccount)
- **ID**: `"NoAccount"`
- **Etiqueta**: `"Sin cuenta"`
- **maxSlots**: `25`
- **hasCloud**: `false`
- **billingType**: `"free"`
- **Descripción**: Modo invitado. Tus datos se guardan solo en este navegador (localStorage).
- **Límite**: 25 elementos totales entre todas las categorías
- **Comportamiento al llegar al límite**: 
  - Se bloquea la creación de nuevos elementos
  - Se muestra notificación de límite alcanzado
  - Se sugiere crear una cuenta gratuita para aumentar el límite
  - Los datos se pierden al borrar caché o cambiar de navegador/pérfil

### 2.2 GRATUITO (FREE/Free)
- **ID**: `"Free"`
- **Etiqueta**: `"Usuario"`
- **maxSlots**: `50`
- **hasCloud**: `false`
- **billingType**: `"free"`
- **Descripción**: Cuenta básica. Acceso a gestión botánica local.
- **Límite**: 50 elementos totales entre todas las categorías
- **Comportamiento al llegar al límite**:
  - Se bloquea la creación de nuevos elementos
  - Se muestra notificación de límite alcanzado
  - Se sugiere actualizar a plan Pro o Premium para más capacidad
  - Los datos persisten mientras exista la cuenta (aunque solo en localStorage)

### 2.3 PRO (PRO)
- **ID**: `"Pro"`
- **Etiqueta**: `"Pro"`
- **maxSlots**: `200`
- **hasCloud**: `true`
- **billingType**: `"one-time"`
- **Descripción**: Pago único. Amplía tu capacidad local permanentemente.
- **Límite**: 200 elementos totales entre todas las categorías
- **Notas importantes**:
  - Aunque el `maxSlots` es 200, en la práctica este plan ofrece 50 (base) + 200 (adicional) = 250 slots
  - Esto se debe a que el plan Pro incluye los 50 slots del plan gratuito como base más 200 adicionales
  - El límite efectivo es 250 elementos totales
  - Tiene sincronización en la nube activada
  - Pago único vitalicio (no requiere suscripción)
- **Comportamiento al llegar al límite**:
  - Se bloquea la creación de nuevos elementos
  - Se muestra notificación de límite alcanzado
  - Se sugiere considerar el plan Premium para capacidad ilimitada

### 2.4 PREMIUM (PREMIUM)
- **ID**: `"Premium"`
- **Etiqueta**: `"Premium"`
- **maxSlots**: `999999` (efectivamente ilimitado)
- **hasCloud**: `true`
- **billingType**: `"subscription"`
- **Descripción**: Acceso total. Sincronización en la nube e ilimitados.
- **Límite**: Ilimitado (999,999 elementos)
- **Comportamiento al llegar al límite**:
  - En la práctica, no hay límite alcanzable bajo condiciones normales de uso
  - El límite es suficientemente alto para considerar el plan ilimitado
  - Tiene sincronización en la nube completa y multi-dispositivo
  - Requiere suscripción activa (mensual/anual)

### 2.5 MASTER (MASTER)
- **ID**: `"Master"`
- **Etiqueta**: `"Master"`
- **maxSlots**: `999999` (efectivamente ilimitado)
- **hasCloud**: `true`
- **billingType**: `"system"`
- **Descripción**: Nivel de sistema. Control total e integridad suprema.
- **Límite**: Ilimitado (999,999 elementos)
- **Uso exclusivo**: Reservado para administradores del sistema y desarrollo interno
- **Características adicionales**:
  - Acceso a todas las funciones administrativas
  - Capacidad para modificar configuraciones del sistema
  - No está disponible para registro público estándar

## 3. IMPLEMENTACIÓN TÉCNICA

### 3.1 Cálculo del Total de Elementos
El total de elementos se calcula en tiempo real mediante la función `usedSlots` en `src/layout/Header.tsx`:

```typescript
const usedSlots = useMemo(() => {
  const invCount = Object.values(data.inventory).reduce((sum, arr) => sum + arr.length, 0);
  const seasonCount = Object.values(data.seasonalTasks).reduce((sum, arr) => sum + arr.length, 0);
  return data.plants.length + data.propagations.length + data.wishlist.length + data.globalNotes.length + invCount + seasonCount;
}, [data]);
```

Esta suma incluye:
- `data.plants.length`: Número de plantas
- `data.propagations.length`: Número de propagaciones
- `data.wishlist.length`: Número de elementos en wishlist
- `data.globalNotes.length`: Número de notas globales
- `invCount`: Total de elementos en todas las categorías de inventario
- `seasonCount`: Total de tareas estacionales

### 3.2 Aplicación del Límite
Los límites se aplican en varios puntos del sistema:

#### 3.2.1 En el Header (Visualización)
En `src/layout/Header.tsx`, el límite actual se muestra mediante:
```typescript
const maxSlotsLabel = isMasterAdmin ? "∞" : String(maxSlots);
// ...
<span className="text-sm text-[var(--text-gray)] opacity-60">/ {maxSlotsLabel} items</span>
```

#### 3.2.2 En Acciones de Creación
Antes de permitir la creación de nuevos elementos, se verifica el límite en los componentes UI y stores correspondientes. Por ejemplo:

- Al agregar una nueva planta: se verifica que `usedSlots < maxSlots`
- Al agregar un elemento al inventario: se verifica que `usedSlots < maxSlots`
- Similar para propagaciones, notas, wishlist y tareas estacionales

#### 3.2.3 Mensajes de Límite
Cuando se intenta superar el límite, se muestran modales de información con mensajes como:
- "Has alcanzado el límite de tu plan actual"
- "Para continuar, considera actualizar tu plan"
- Específicos por categoría cuando aplica

### 3.3 Sincronización y Persistencia
- Los planes sin `hasCloud: true` (NONE y FREE) almacenan datos únicamente en `localStorage`
- Los planes con `hasCloud: true` (PRO, PREMIUM, MASTER) sincronizan con Supabase
- El límite se aplica igualmente tanto en localStorage como en la nube
- Al sincronizar, se verifica que el total no exceda el límite del plan

## 4. CONSIDERACIONES DE USO

### 4.1 Monitoreo de Uso
Los usuarios pueden ver su uso actual en:
- Header de la aplicación: muestra `usedSlots / maxSlots`
- Página de perfil (`/profile`): muestra detalles del plan y uso
- Notificaciones cuando se acerca al límite (usualmente al 80% y 95%)

### 4.2 Actualización de Planes
- Al actualizar de un plan con límite menor a uno mayor: el límite aumenta inmediatamente
- Al downgradear de un plan con límite mayor a uno menor:
  - Si el uso actual está por debajo del nuevo límite: se permite el cambio
  - Si el uso actual está por encima del nuevo límite: se bloquea el downgrade hasta reducir el uso
  - Se ofrece opción de archivar o eliminar elementos para reducir el conteo

### 4.3 Casos Especiales
- **Elementos eliminados**: van a la papelera y aún cuentan hacia el límite hasta que se eliminan permanentemente
- **Restauración desde papelera**: verifica que haya espacio disponible antes de restaurar
- **Importación de JSON**: verifica que el total existente + importado no exceda el límite
- **Sincronización inicial**: verifica que los datos a sincronizar no excedan el límite del plan

## 5. RECOMENDACIONES PARA DESARROLLADORES

### 5.1 Agregando Nuevas Categorías
Si se agrega una nueva categoría de elementos que deba contar hacia el límite:
1. Añadir el conteo de esa categoría en la función `usedSlots` en `src/layout/Header.tsx`
2. Actualizar los componentes donde se crean elementos de esa categoría para verificar el límite
3. Asegurarse de que la lógica de límite se aplique consistentemente en stores y UI

### 5.2 Pruebas de Límites
Al desarrollar nuevas funcionalidades:
- Probar el comportamiento exactamente en el límite (usedSlots === maxSlots)
- Probar el intento de exceder el límite (usedSlots + 1 > maxSlots)
- Verificar mensajes de error apropiados
- Confirmar que se permite la acción cuando usedSlots < maxSlots

### 5.3 Internacionalización
Los mensajes relacionados con límites deben estar disponibles para internacionalización mediante el sistema de stores existente.

## 6. EJEMPLOS DE CÁLCULO

### Ejemplo 1: Usuario Gratuito (FREE)
- 15 plantas
- 8 propagaciones  
- 5 notas globales
- 12 elementos de inventario (3 sustratos, 4 fertilizantes, 5 otros)
- 3 wishlist items
- 4 tareas estacionales
**Total**: 15 + 8 + 5 + 12 + 3 + 4 = 47/50 slots utilizados (3 disponibles)

### Ejemplo 2: Usuario Pro (PRO)
- 40 plantas
- 25 propagaciones
- 10 notas globales
- 35 elementos de inventario
- 15 wishlist items
- 10 tareas estacionales
**Total**: 40 + 25 + 10 + 35 + 15 + 10 = 135/250 slots utilizados (115 disponibles)

### Ejemplo 3: Límite Alcanzado
Usuario en plan Sin cuenta (NONE) con:
- 10 plantas
- 6 propagaciones
- 4 notas globales
- 3 elementos de inventario
- 2 wishlist items
**Total**: 10 + 6 + 4 + 3 + 2 = 25/25 slots utilizados
- El próximo intento de crear cualquier elemento fallará con mensaje de límite alcanzado

---
*Este especificación refleja el estado actual de los límites de planes según definido en `src/data/configProject.ts` y su implementación en todo el códigobase de PlantitasApp V5.*