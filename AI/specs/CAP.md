# AI/specs/CAP.md: LÍMITES DE PLANES (CAPS) - Plantacora V5

Este documento especifica los límites de capacidad (caps) y las políticas de retención para cada nivel de plan en Plantacora.

## 1. VISIÓN GENERAL

Los caps en Plantacora limitan el número total de elementos que un usuario puede tener almacenados. Estos límites se aplican a la **suma de todos los elementos** (incluyendo los que están en la papelera) en las siguientes categorías:

- **Plantas** (`src/core/plant/domain/Plant.ts`)
- **Propagaciones** (`src/core/nursery/domain/Propagation.ts`) 
- **Inventario** (`src/core/inventory/domain/InventoryItem.ts`) - todas las categorías
- **Notas Globales** (`src/core/notes/domain/GlobalNote.ts`)
- **Lista de Deseos** (`src/core/wishlist/domain/WishlistItem.ts`)
- **Tareas Estacionales** (`src/core/season/domain/SeasonTask.ts`)

## 2. ESPECIFICACIONES POR PLAN (Se toman de ConfigProject)

| Plan | ID | maxSlots | Cloud | Retención Papelera | Tipo Billing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sin cuenta** | `NoAccount` | 25 | No | 1 mes (30 días) | Free |
| **Usuario** | `Free` | 50 | No | 2 meses (60 días) | Free |
| **Pro** | `Pro` | 300 | Sí | 3 meses (90 días) | One-time |
| **Premium** | `Premium` | 999,999 | Sí | 6 meses (180 días) | Subscription |
| **Master** | `Master` | 999,999 | Sí | Sin límite | System |

### 2.1 Políticas de Retención (Papelera)
Los elementos eliminados se mueven a la papelera. 
- **Siguen contando** para el límite de `maxSlots` hasta que se borran permanentemente.
- Se eliminan automáticamente según el tiempo de vigencia de cada plan.
- El usuario puede borrarlos manualmente en cualquier momento para liberar espacio.

## 3. IMPLEMENTACIÓN TÉCNICA

### 3.1 Configuración Centralizada ✅ DONE
`src/data/configProject.ts` ya tiene los valores correctos:

```typescript
plans: {
  NONE: { ..., maxSlots: 25, trashRetentionDays: 30 },
  FREE: { ..., maxSlots: 50, trashRetentionDays: 60 },
  PRO: { ..., maxSlots: 300, trashRetentionDays: 90 },
  PREMIUM: { ..., maxSlots: 999999, trashRetentionDays: 180 },
  MASTER: { ..., maxSlots: 999999, trashRetentionDays: 9999 },
}
```

### 3.2 "El Muro" (checkCapLimit) — PARCIALMENTE DONE, 2 bugs pendientes

**Estado actual:** La función existe en `src/store/plantStore.ts:116` pero tiene dos problemas.

#### Bug 1: Import faltante ❌
`getEffectiveMaxSlots` se llama en línea 124 pero NO está en el import de `syncService`.

**Fix:** En `src/store/plantStore.ts`, línea 10, agregar `getEffectiveMaxSlots` al import:
```typescript
// ANTES:
import { hasPremium, syncToSupabase, loadFromSupabase } from "@/libs/syncService";

// DESPUÉS:
import { hasPremium, getEffectiveMaxSlots, syncToSupabase, loadFromSupabase } from "@/libs/syncService";
```

#### Bug 2: Trash no contabilizado para plan Pro ❌
El spec dice que items en papelera SIGUEN contando para `maxSlots`.
- **Free/NoAccount**: sin cloud, sin soft-delete → trash no existe → no aplica.
- **Premium/Master**: 999999 slots → trash irrelevante en la práctica.
- **Pro**: 300 slots → trash SÍ importa. Hay que sumarlo.

**Solución: `$trashCount` atom cacheado (NO async en checkCapLimit)**

`checkCapLimit` es síncrona y se llama en múltiples lugares. No puede hacer fetch. La solución es un atom que cachea el conteo de trash y se actualiza cuando se carga la papelera.

**Paso A — Agregar atom en `src/store/plantStore.ts`:**
```typescript
// Después de las otras exportaciones de atoms (línea 111):
export const $trashCount = atom<number>(0);
```

**Paso B — En `checkCapLimit` (`src/store/plantStore.ts:116`), sumar `$trashCount.get()`:**
```typescript
export const checkCapLimit = (): boolean => {
  const data = $store.get();
  const user = $user.get();
  
  const invCount = Object.values(data.inventory).reduce((sum: number, arr: any[]) => sum + arr.length, 0);
  const seasonCount = Object.values(data.seasonalTasks).reduce((sum: number, arr: any[]) => sum + arr.length, 0);
  const activeSlots = data.plants.length + data.propagations.length + data.wishlist.length + data.globalNotes.length + invCount + seasonCount;
  const usedSlots = activeSlots + $trashCount.get(); // trash cuenta para Pro
  
  const maxSlots = getEffectiveMaxSlots(user);
  // ... resto igual
};
```

**Paso C — En `src/app/(admin)/profile/page.tsx`, setear `$trashCount` cuando carga trash:**

La función `handleToggleTrash` (línea 64) ya llama `loadTrashFromSupabase`. Agregar:
```typescript
// Agregar import:
import { $store, $trashCount } from "@/store/plantStore";

// En handleToggleTrash, después de setTrashItems(items):
$trashCount.set(items.length);
```

**Paso D — Limpiar `$trashCount` al hacer delete permanente:**

En `handleDeletePermanently` (profile page), después de filtrar el item borrado de `trashItems`:
```typescript
$trashCount.set(trashItems.length - 1); // o recalcular desde el array actualizado
```

---

### 3.3 Importación Masiva con Overflow — PENDIENTE ❌

**Flujo esperado:**
1. Usuario importa JSON en el Header.
2. Se parsea el JSON y se calcula cuántos slots nuevos trae (items que NO están en el store actual, identificados por `id`).
3. Si `activeSlots + newItems > maxSlots`: NO se hace mergeData. Se abre modal de selección.
4. Modal muestra los ítems nuevos con checkboxes. El usuario elige cuáles importar hasta llenar el cupo disponible (`availableSlots = maxSlots - activeSlots - $trashCount`).
5. Al confirmar: solo se mergean los ítems seleccionados.
6. Si no hay overflow: merge normal como ahora.

**Archivos a modificar:**

#### A) `src/store/plantStore.ts` — nueva función `mergeDataSelective`
```typescript
// Mergea solo los items elegidos por el usuario (viene del modal de import overflow)
export const mergeDataSelective = (incomingData: any, selectedIds: Set<number>) => {
  const incoming = normalizeData(incomingData);
  const data = $store.get();

  const filterSelected = (items: any[]) => items.filter(i => selectedIds.has(i.id));

  const mergeById = (local: any[], imported: any[]) => {
    const map = new Map();
    local.forEach(item => map.set(item.id, item));
    filterSelected(imported).forEach(item => map.set(item.id, item));
    return Array.from(map.values());
  };

  $store.set({
    plants: mergeById(data.plants, incoming.plants),
    propagations: mergeById(data.propagations, incoming.propagations),
    globalNotes: mergeById(data.globalNotes, incoming.globalNotes),
    wishlist: mergeById(data.wishlist, incoming.wishlist),
    inventory: mergeInventory(data.inventory, incoming.inventory), // inventory no tiene IDs, se mergea completo
    seasonalTasks: incoming.seasonalTasks,
  });
  setDirty(false);
};
```

> Nota: `mergeInventory` es una función local dentro de `mergeData`. Hay que extraerla como función de módulo para reutilizarla en `mergeDataSelective`. Moverla fuera del closure de `mergeData`.

#### B) `src/store/modalStore.ts` — agregar tipo `"importSelect"`
Verificar cómo está tipado `$activeModal`. Agregar `"importSelect"` al union type si está tipado estrictamente. Props que necesita:
```typescript
{
  type: "importSelect";
  props: {
    importedData: any;           // el JSON completo parseado
    newItems: ImportSelectItem[]; // items nuevos (no en store actual)
    availableSlots: number;       // cuántos puede elegir
  };
}
```

#### C) `src/layout/Header.tsx` — lógica de overflow antes del merge
Reemplazar el `onChange` del input de importación:

```typescript
reader.onload = (ev) => {
  try {
    const importedData = JSON.parse(ev.target?.result as string);
    const normalized = normalizeData(importedData); // necesita ser exportada desde plantStore
    const data = $store.get();
    const user = $user.get(); // necesita import de authStore
    
    // Calcular items nuevos (no presentes en store actual por ID)
    const existingIds = new Set([
      ...data.plants.map(p => p.id),
      ...data.propagations.map(p => p.id),
      ...data.globalNotes.map(n => n.id),
      ...data.wishlist.map(w => w.id),
    ]);
    
    const newItems: ImportSelectItem[] = [
      ...normalized.plants.filter(p => !existingIds.has(p.id)).map(p => ({ id: p.id, label: p.name, category: "Planta" })),
      ...normalized.propagations.filter(p => !existingIds.has(p.id)).map(p => ({ id: p.id, label: p.name, category: "Propagación" })),
      ...normalized.globalNotes.filter(n => !existingIds.has(n.id)).map(n => ({ id: n.id, label: n.content.slice(0, 40), category: "Nota" })),
      ...normalized.wishlist.filter(w => !existingIds.has(w.id)).map(w => ({ id: w.id, label: w.name, category: "Wishlist" })),
    ];
    
    const invCount = Object.values(data.inventory).reduce((sum: number, arr: any[]) => sum + arr.length, 0);
    const seasonCount = Object.values(data.seasonalTasks).reduce((sum: number, arr: any[]) => sum + arr.length, 0);
    const activeSlots = data.plants.length + data.propagations.length + data.wishlist.length + data.globalNotes.length + invCount + seasonCount;
    const availableSlots = getEffectiveMaxSlots(user) - activeSlots - $trashCount.get();
    
    if (newItems.length > availableSlots) {
      // Overflow: abrir modal de selección
      openModal("importSelect", { importedData, newItems, availableSlots });
    } else {
      // Sin overflow: merge normal
      mergeData(importedData);
      openModal("info", { title: "¡Sincronizado!", message: "Fusión completada." });
    }
  } catch {
    openModal("info", { title: "Error", message: "JSON corrupto." });
  }
};
```

> Imports adicionales que necesita Header.tsx: `normalizeData`, `$trashCount` desde `plantStore`; `$user` desde `authStore`; `getEffectiveMaxSlots` desde `syncService`.

#### D) `src/components/ui/Modals.tsx` — nuevo modal `ImportSelectModal`

Componente que recibe `importedData`, `newItems[]`, `availableSlots`:

- Muestra: "Tenés espacio para **N** ítems nuevos. Seleccioná cuáles importar."
- Lista scrolleable de `newItems` con checkbox por item, agrupados por categoría.
- Contador en tiempo real: "X / N seleccionados". Deshabilitar checkboxes al llegar al límite.
- Botones: "Cancelar" / "Importar Seleccionados" (disabled si 0 seleccionados).
- Al confirmar: llama `mergeDataSelective(importedData, selectedIds)` luego cierra modal y muestra info de éxito.

**Tipo `ImportSelectItem`** (definir en `plantStore.ts` o en un types file):
```typescript
export interface ImportSelectItem {
  id: number;
  label: string;
  category: "Planta" | "Propagación" | "Nota" | "Wishlist";
}
```

---

## 4. ORDEN DE EJECUCIÓN

```
1. [FÁCIL]   Fix import getEffectiveMaxSlots — plantStore.ts línea 10
2. [FÁCIL]   Agregar $trashCount atom — plantStore.ts después línea 111
3. [FÁCIL]   Actualizar checkCapLimit para sumar $trashCount — plantStore.ts línea 116
4. [MEDIO]   Setear $trashCount en profile/page.tsx (handleToggleTrash + handleDeletePermanently)
5. [MEDIO]   Extraer mergeInventory como función de módulo en plantStore.ts
6. [MEDIO]   Agregar mergeDataSelective + ImportSelectItem a plantStore.ts
7. [MEDIO]   Agregar tipo "importSelect" a modalStore.ts
8. [DIFÍCIL] Lógica overflow en Header.tsx (imports adicionales + cálculo + openModal)
9. [DIFÍCIL] ImportSelectModal en Modals.tsx (UI con checkboxes, contador, límite)
```

---
*Ultima actualización: 20 de Abril, 2026. Plan de implementación detallado post-análisis de código.*
