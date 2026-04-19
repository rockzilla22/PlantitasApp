# AI/specs/EMOJI_TO_ICONS_MIGRATION.md: Reemplazar Emojis por SVGs

## 1. VISIÓN

Reemplazar TODOS los emojis del proyecto por icons SVG en `/public/icons/`. Esto incluye:

- Íconos de UI (botones, acciones)
- Íconos de acciones (riego, poda, fertilizante)
- Íconos de ambiente (luz, dormancia)
- Íconos de tipos de plantas
- Íconos de categorías de inventario

## 2. ESTRUCTURA DE ICONS

```
/public/icons/
├── common/                    → UI General (úsanse en todo el app)
│   ├── edit.svg              → ✏️ Editar
│   ├── delete.svg           → 🗑️ Eliminar
│   ├── plus.svg            → ➕ Agregar
│   ├── check.svg           → ✅ Completado
│   ├── close.svg           → ❌ Cerrar
│   ├── chevron-left.svg    → ◀ Atrás
│   ├── chevron-right.svg   → ▶ Adelante
│   ├── search.svg          → 🔍 Buscar
│   ├── filter.svg          → 🔽 Filtrar
│   ├── sort.svg           → ⇅ Ordenar
│   ├── export.svg         → 📤 Exportar
│   ├── import.svg        → 📥 Importar
│   ├── filter.svg        → 🔽 Filtrar
│   ├── user.svg          → 👤 Usuario
│   ├── logout.svg        → 🚪 Cerrar sesión
│   ├── menu.svg          → ☰ Menú
│   └── info.svg          → ℹ️ Info
│
├── environment/               → Luz y Clima
│   ├── light-high.svg       → ☀️ Alta/Directa
│   ├── light-high-indirect.svg → ☀️ Alta/Indirecta
│   ├── light-medium.svg    → ⛅ Media
│   ├── light-low.svg     → ☁️ Baja
│   ├── dormancy-winter.svg → ❄️ Invierno
│   ├── dormancy-summer.svg → ☀️ Verano
│   └── dormancy-none.svg   → 🚫 Ninguna
│
├── actions/                  → LOG_ACTIONS
│   ├── water.svg           → 💧 Riego
│   ├── fertilizer.svg      → 🧴 Fertilizante
│   ├── medicine.svg        → 💊 Insecticidas/Medicinas
│   ├── liquid.svg         → 🧪 Líquidos
│   ├── powder.svg         → ⚪ Polvos
│   ├── substrate.svg     → 🟤 Sustrato
│   ├── pest.svg          → 🐛 Plaga/Enfermedad
│   ├── prune.svg         → ✂️ Poda
│   ├── repot.svg         → 🛒 Trasplante
│   ├── measure.svg       → 📏 Medición
│   ├── note.svg         → 📝 Nota
│   ├── plant.svg        → 🌱 Registro Nuevo
│   └── seed.svg         → 🌱 Siembra
│
├── plants/                  → Tipos de plantas (para UI, no Garden)
│   ├── alocasia.svg
│   ├── arbusto.svg
│   ├── aromatica.svg
│   ├── cactus.svg
│   ├── carnivora.svg
│   ├── flor.svg
│   ├── frutal.svg
│   ├── hierba.svg
│   ├── monstera.svg
│   ├── philodendron.svg
│   ├── syngonium.svg
│   ├── clover.svg
│   ├── generic.svg
│   └── custom.svg
│
├── pots/                    → Tipos de macetas
│   ├── autorriego.svg
│   ├── barro.svg
│   ├── plastic.svg
│   ├── orquidea.svg
│   └── terracotta.svg
│
├── inventory/               → Categorías de inventario
│   ├── fertilizers.svg
│   ├── meds.svg
│   ├── liquids.svg
│   ├── powders.svg
│   ├── substrates.svg
│   └── others.svg
│
├── navigation/              → Navegación
│   ├── plants.svg         → 🌱 Plantas
│   ├── nursery.svg        → 🧪 Propagación
│   ├── inventory.svg     → 📦 Inventario
│   ├── season.svg        → 📅 Tareas
│   ├── wishlist.svg     → ✨ Wishlist
│   ├── notes.svg       → 📝 Notas
│   ├── profile.svg     → 👤 Perfil
│   ├── garden.svg      → 🏡 Jardín
│   ├── pricing.svg     → 💰 Pricing
│   ├── home.svg        → 🏠 Home
│   └── admin.svg       → ⚙️ Admin
│
└── status/                 → Estados
    ├── synced.svg        → ☁️ Sincronizado
    ├── syncing.svg       → ⟳ Sincronizando
    ├── warning.svg      → ⚠️ Advertencia
    ├── error.svg       → ❌ Error
    ├── empty.svg       → 📭 Vacío
    └── success.svg     → ✅ Éxito
```

### Convenciones de los SVGs

```svg
<!-- Tamaño: 24x24 (estándar) o 20x20 (small) -->
<!-- Color: currentColor (se hereda del CSS) -->
<!-- Stroke: 1.5 o 2px -->

<svg 
  xmlns="http://www.w3.org/2000/svg"
  width="24" 
  height="24" 
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- Path aqui -->
</svg>
```

## 3. INTEGRACIÓN EN CATALOG.TS

### Actualizar tipos

```typescript
export type IconOption = Option & {
  img: string;          // Ruta: "/icons/actions/water.svg"
  svg?: string;         // Ruta assets (opcional)
};

export const LOG_ACTIONS: IconOption[] = [
  { 
    value: "Riego", 
    label: "Riego", 
    img: "/icons/actions/water.svg" 
  },
  { 
    value: "Fertilizante", 
    label: "Fertilizante", 
    img: "/icons/actions/fertilizer.svg",
    inventoryCategory: "fertilizers" 
  },
  // ...
];

// Helper
export function getActionIcon(action: string): string {
  const act = LOG_ACTIONS.find(a => a.value === action);
  return act?.icon || "/icons/actions/note.svg";
}
```

### Catálogo actualizado src\data\catalog.ts

## 4. COMPONENTE ICONO

### Icon.tsx

```tsx
"use client";

import React from "react";

interface IconProps {
  name: string;           // "water", "fertilizer", etc (sin extensión)
  size?: number;         // default: 24
  className?: string;
}

export function Icon({ name, size = 24, className }: IconProps) {
  return (
    <img 
      src={`/icons/${name}.svg`}
      width={size}
      height={size}
      className={className}
      alt={name}
    />
  );
}
```

### Alternativa: Inline SVG (mejor para performance)

```tsx
"use client";

import { useIcon } from "@/hooks/useIcon";

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 24, className }: IconProps) {
  const { path, loading } = useIcon(name);
  
  if (loading || !path) {
    return <span style={{ width: size, height: size }} />;
  }
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24"
      className={className}
    >
      <path d={path} fill="currentColor" />
    </svg>
  );
}
```

## 5. MAPEO DE USOS EN EL CÓDIGO

### Dónde buscar y reemplazar

| Archivo | Emojis a reemplazar | Cantidad |
|--------|----------------|--------|
| `src/app/page.tsx` | 🌿, 🌱 | ~5 |
| `src/app/(pages)/plants/page.tsx` | 🌿, 🌱, 💧 | ~20 |
| `src/app/(pages)/nursery/page.tsx` | 🌱 | ~10 |
| `src/app/(pages)/inventory/page.tsx` | 🧴, 📦 | ~15 |
| `src/app/(pages)/wishlist/page.tsx` | ✨ | ~5 |
| `src/app/(pages)/notes/page.tsx` | 📝 | ~5 |
| `src/app/(pages)/season/page.tsx` | 🌸 | ~10 |
| `src/app/(pages)/profile/page.tsx` | 🗑️ | ~5 |
| `src/components/sections/PlantGrid.tsx` | 🌿 | ~10 |
| `src/components/sections/PlantDetailPanel.tsx` | 🌿, ☀️, 💧 | ~30 |
| `src/components/ui/Modals.tsx` | ✅, ❌ | ~10 |
| `src/store/plantStore.ts` | 🌿 | ~5 |

## 6. IMPLEMENTATION CHECKLIST

### Fase 1: UI (progressive)
En general, ya no se usarán emojis, se deben usar los SVG que correspondan en el catalog o los directos en su caso.
Pregunta si tienes dudas antes de ejecutar.
Hay campos que antes tenían emoji y ahorita no, es porqué el CLI se detuvo a medio proceso y no terminó.
- [ ] 13. Reemplazar en PlantGrid.tsx
- [ ] 14. Reemplazar en PlantDetailPanel.tsx
- [ ] 15. Reemplazar en todas las pages
- [ ] 16. Reemplazar en Modals.tsx
- [ ] 17. Reemplazar en todos los archivos.

### Fase 2: Limpieza
- [ ] 17. Verificar que no queden emojis huérfanos
- [ ] 18. Test en diferentes browsers
- [ ] 19. Test en mobile

## 7. EJEMPLO DE REEMPLAZO

### Antes (con emoji)

```tsx
<button>
  💧 Regar
</button>
```

### Después (con Icon)

```tsx
import { Icon } from "@/components/ui/Icon";

<button>
  <Icon name="water" size={18} />
  Regar
</button>
```

## 8. FALLBACK

```typescript
// Si el SVG no existe, usar emoji
// Esto permite deploy incremental

export function getIconSafe(name: string): string {
  try {
    return `/icons/${name}.svg`;
  } catch {
    return EMOJI_FALLBACK[name] || "📝";
  }
}

const EMOJI_FALLBACK: Record<string, string> = {
  water: "💧",
  fertilizer: "🧴",
  // ...
};
```

## 9. PRIORIDADES DE REEMPLAZO

| Prioridad | Área | Razón |
|----------|------|-------|
| 1 | Navigation | Visible siempre, afecta UX |
| 2 | Actions (logs) | Uso frecuente, consistente |
| 3 | Status (synced, error) | Feedback visual crítico |
| 4 | Plant cards | Alto impacto visual |
| 5 | Categories (inventory) | Menos visible |

---

## 10. NOTAS

- **No es todo o nada** → Se puede hacer incrementally
- **Fallback siempre** → Si el SVG no existe, dejar "<emoji>" y notificar para buscar un svg y/o crearlo.
- **IGUALAR color** → Usar `currentColor` en SVG para que herede del CSS
- **IGUALAR tamaño** → Usar un tamaño acorde al texto, para mantener tamaño alineados
- **Testing** → Verificar en Chrome, Safari, Firefox, mobile
- **Performance** → Los SVGs deben cachearse en browser