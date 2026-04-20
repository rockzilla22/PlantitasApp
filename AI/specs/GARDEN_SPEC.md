# AI/specs/GARDEN_SPEC.md: Garden View - Gamification System

## 1. VISIÓN GENERAL

**Garden** es una vista visual donde el usuario ve su "casa/jardín" con sus plantas, propagaciones e inventario representedos como objetos visuais. Es una gamificación ligera que:

- Da feedback visual del progreso del usuario
- Motivates a agregar más registros
- Genera attachment emocional a la colección
- Prepara el terreno para skins monetizeadas

---

## 2. MAPEO DE DATOS A VISUALES

| Tipo de Item | Representación en Garden | SVG Path | Condición |
|--------------|--------------------------|---------|-----------|
| **Plant (status: alive)** | Maceta + ícono planta | `/assets/{tier}/pots/{potType}.svg` + `/assets/{tier}/plants/{plantType}.svg` | `deleted_at: null` |
| **Plant (status: eliminated)** | ❌ No aparece | - | `deleted_at: not null` |
| **Propagation (status: Activo)** | Semilla/sobre en tierra | `/assets/standard/plants/seedling.svg` | `deleted_at: null` |
| **Propagation (status: Trasplantada)** | Maceta pequeña | `/assets/standard/pots/small.svg` + `/assets/standard/plants/small.svg` | `deleted_at: null` |
| **Propagation (status: Éxito/Fracaso)** | ✗ No aparece | - | `status !== 'Activo'` |
| **Inventory: Fertilizer** | Bolsa en rack | `/assets/standard/inventory/fertilizers.svg` | qty > 0 |
| **Inventory: Sustrato** | Montón de tierra | `/assets/standard/inventory/substrates.svg` | qty > 0 |
| **Inventory: Medicina** | Botella spray | `/assets/standard/inventory/meds.svg` | qty > 0 |
| **Inventory: Líquido** | Botella | `/assets/standard/inventory/liquids.svg` | qty > 0 |
| **Inventory: Polvo** | Bolsa | `/assets/standard/inventory/powders.svg` | qty > 0 |

> **Nota**: Los paths usan `{tier}` = `standard` o `premium` según lo que el usuario haya comprado.

---

## 3. GARDEN VIEW LAYOUT

```
┌─────────────────────────────────────────────┐
│  🌱 Mi Jardín                    [skins $]   │
├─────────────────────────────────────────────┤
│                                             │
│    [Maceta 1]    [Maceta 2]    [Macetas ...]│
│       🌿            🌿            🌿       │
│                                             │
│              [Semilla 1]  [Semilla 2]      │
│                 🌱            🌱            │
│                                             │
│  [Tierra] [Bolsa] [Spray]   [más registros...] │
│                                             │
│  ___________________________________________│
│  💡 Tu jardín tiene X registros - ¡Agrega más! │
└─────────────────────────────────────────────┘
```

### Zonas de Renderizado
1. **Main Area**: Plantas (macetas distribuidas en grid flexible)
2. **Seedbed**: Propagaciones activas
3. **Shed/Shelf**: Inventario (Items)
4. **Info Bar**: Stats + motivational message

---

## 4. INTERACCIÓN

### Click en Planta del Garden
```
UsuarioHaceClick(planta en garden)
    → Buscar planta real por ID
    → Abrir Modal con:
        ├── Nombre de la planta
        ├── Icon 🌿
        ├── Última fecha de riego
        ├── Ubicación
        └── Link → "Ver en /plants"
```

### Flujo Detalle
```tsx
// GardenItem.tsx
<ClickableArea onClick={() => openPlantDetail(plant.id)}>

// Modal (same as PlantDetailPanel but smaller)
<Modal name="garden-plant-detail" plant={selectedPlant}>
  <h2>{plant.name} 🌿</h2>
  <p>📍 {plant.location}</p>
  <p>💧 Último riego: {plant.lastWateredDate}</p>
  <p>☀️ Luz: {plant.light}</p>
  
  <Link href={`/plants?plant=${plant.id}`}>
    Ver detalle completo →
  </Link>
</Modal>
```

---

## 5. DISTRIBUCIÓN DE registros

### Algoritmo de Layout
```typescript
function distributeItems(Items: GardenItem[]): Position[] {
  // Grid responsive: 3-6 registros por fila según screen
  // Posición aleatoria sutil para "natural look"
  // No overlapping
  
  const gridCols = getGridCols(windowWidth); // 3, 4, 5, 6
  const spacing = 80; // px
  
  return registros.map((item, index) => ({
    row: Math.floor(index / gridCols),
    col: index % gridCols,
    x: (index % gridCols) * spacing + random(-10, 10),
    y: Math.floor(index / gridCols) * spacing + random(-5, 5),
  }));
}
```

### Animación de Entrance
```css
.garden-item {
  animation: floatIn 0.5s ease-out;
  /* Keyframes: scale 0 → 1, opacity 0 → 1 */
}
```

---

## 6. SKINS SYSTEM (Monetización)

### Estructura Completa de Assets

```
/public/
├── assets/                          → ILUSTRACIONES Y SKINS (El "Arte")
│   ├── standard/                    → Versiones gratuitas
│   │   ├── garden/                  → Fondos del jardín (patio.svg, basic.svg)
│   │   ├── plants/                  → Ilustraciones de plantas (monstera.svg)
│   │   ├── pots/                    → Ilustraciones de macetas (barro.svg)
│   │   └── inventory/                   → Basado en INVENTORY_CATEGORIES
│   │       ├── fertilizers.svg
│   │       ├── meds.svg
│   │       ├── substrates.svg
│   │       └── others.svg
│   └── premium/                     → Versiones de pago
│       ├── garden/                  → Fondos (cottage.svg, greenhouse.svg)
│       ├── plants/                  → Ilustraciones premium (monstera_p.svg)
│       ├── pots/                    → Macetas premium (barro_p.svg)
│       └── inventory/                   → Inventory premium
│
└── icons/                           → ICONOS DE UI (Funcionales/Pequeños)
    ├── environment/                 → Clima y Luz (LIGHT_LEVELS, DORMANCIES)
    │   ├── light-high.svg
    │   ├── light-mid.svg
    │   ├── light-low.svg
    │   ├── winter.svg               → (Dormancia Invierno)
    │   └── summer.svg               → (Dormancia Verano)
    ├── actions/                     → Basado en LOG_ACTIONS
    │   ├── water.svg                → (Riego)
    │   ├── prune.svg                → (Poda)
    │   ├── repot.svg                → (Trasplante)
    │   └── pest.svg                 → (Plaga)
    └── common/                      → UI General
        ├── edit.svg
        ├── delete.svg
        └── plus.svg
```

### Resumen de Carpetas

| Carpeta | Contenido | Tamaño | Uso |
|--------|----------|--------|------|
| `/assets/` | Ilustraciones | Grande (100x100+) | Garden, plantas, macetas |
| `/icons/` | Íconos UI | Pequeño (24x24) | Botones, acciones, UI |

### Lógica de Carga

```
1. ¿El usuario tiene el item premium comprado?
   → SÍ: cargar de /assets/premium/{category}/
   → NO: cargar de /assets/standard/{category}/

2. ¿El SVG premium no existe?
   → fallback a /assets/standard/{category}/

3. ¿Ningún SVG existe?
   → usar emoji fallback
```

### Skin Types
| ID | Nombre | Path | Precio | Tipo |
|----|--------|------|--------|------|
| **default** | Patio BASIC | `/assets/standard/garden/default.svg` | $0 | estándar |
| **basic** | Patio Simple | `/assets/standard/garden/basic.svg` | $0 | estándar |
| **patio** | Patio Standard | `/assets/standard/garden/patio.svg` | $0 | estándar |
| **cottage** | Casa de Campo | `/assets/premium/garden/cottage.svg` | $1 | premium |
| **greenhouse** | Invernáculo | `/assets/premium/garden/greenhouse.svg` | $2 | premium |
| **zen** | Jardín Zen | `/assets/premium/garden/zen.svg` | $2 | premium |
| **tropical** | Selva Tropical | `/assets/premium/garden/tropical.svg` | $2 | premium |
| **minimal** | Moderno | `/assets/premium/garden/minimal.svg` | $1 | premium |

### Future Decorations (v2)
- Macetas diferentes
- Gnomos 🧙
- Bancos 🪑
- Fuentes 💦
- Luces 🏮
- Cercas 🚧

### Implementación de Skins
```typescript
// En Supabase user_metadata
{
  garden_skin: string;
  unlocked_skins: string[];      // IDs de skins compradas
  skin_purchased_at: string;
}

// En catalog.ts (single source of truth)
import { GARDEN_SKINS, getSkinById } from '@/data/catalog';

// Helper para obtener la ruta del SVG
function getGardenBackground(user: User): string {
  const skinId = user.raw_app_meta_data?.garden_skin || 'default';
  const skin = getSkinById(skinId);
  
  // Si es premium y no lo ha comprado, volver a default
  if (skin?.premium && !hasPurchasedSkin(user, skinId)) {
    return '/assets/garden/standard/default.svg';
  }
  
  return skin?.background || '/assets/garden/standard/default.svg';
}

// En store
const $gardenConfig = map({
  skin: 'default',
  unlockedSkins: ['default'], // skins compradas
});

// En Garden page
<Background src={getGardenBackground(user)} />
```

### Compra de Skin
```
/api/checkout
  → POST { productId: 'skin_cottage', type: 'skin' }
  → Returns Stripe Checkout URL
  → Webhook actualiza unlockedSkins
```

---

## 7. COMPONENTES A IMPLEMENTAR

### Nuevos Componentes
```
src/components/garden/
├── GardenPage.tsx        // Main container
├── GardenGrid.tsx      // Plantas distribution
├── GardenSeedbed.tsx   // Propagaciones
├── GardenShelf.tsx      // Inventario
├── GardenItem.tsx       // Individual clickable item
├── GardenModal.tsx     // Plant detail popup
└── SkinSelector.tsx    // Skin picker modal
```

### Rutas
```
/garden                 // Garden view
/garden/skins          // Skin shop
```

---

## 8. IMPLEMENTATION CHECKLIST

- [ ] 1. Crear GardenPage component estructura
- [ ] 2. Connect to plantStore for plants
- [ ] 3. Render plantas como macetas con icon
- [ ] 4. Render propagaciones como semillas
- [ ] 5. Render inventario como shelf registros
- [ ] 6. Implementar click → modal con details
- [ ] 7. Animations de entrance
- [ ] 8. Responsive layout
- [ ] 9. Basic 'default' skin
- [ ] 10. Skin selector UI
- [ ] 11. Stripe checkout para skins
- [ ] 12. Unlock skin en purchase success

---

## 9. PRECIO DE SKINS RECOMENDADOS

| Skin | Precio USD |
|------|------------|
| Cottage | $1 |
| Greenhouse | $2 |
| Zen | $2 |
| Tropical | $2 |
| Minimal | $1 |

Total potential: $8 por set completo
Por qué $1-2? Low friction, impulse buy, no requiere suscripción

---

## 10. NOTAS

- **No level up por ahora**: Solo aparecen registros cuando existen
- **Es responsive**: Mobile = 2-3 columns, Desktop = 4-6
- **Cada item clickeable**: Link directo a la planta real
- **Skins son permanentes**: No expiran, una vez compradas son tuyas
- **Groundwork para decoraciones**: La arquitectura acepta añadirlos luego