# AI/specs/GARDEN_SPEC.md: Garden View - Rooms System

## 1. VISIÓN GENERAL

**Garden** es una vista visual tipo "mapa virtual" de la casa del usuario, dividida por rooms/zones. Cada cuarto de la casa se representa como un panel visual donde aparecen las plantas asignadas a ese espacio.

- Feedback visual del estado del hogar botánico
- Motivación para agregar más plantas a cada cuarto
- attachment emocional a la colección por espacio físico
- **Cada cuarto tiene skin/propio diseño**: el usuario puede personalizar la estética de cada habitación independientemente (monetización por cuarto)

---

## 2. ARQUITECTURA DE ZONAS/ROOMS

### Source of Truth
Las zonas disponibles vienen de `@/data/catalog.ts.PLANT_LOCATIONS`:

```
PLANT_LOCATIONS = [
  { value: "Balcón", img: "...", label: "Balcón" },
  { value: "Baño", img: "...", label: "Baño" },
  { value: "Cocina", img: "...", label: "Cocina" },
  { value: "Comedor", img: "...", label: "Comedor" },
  { value: "Entrada", img: "...", label: "Entrada" },
  { value: "Estudio", img: "...", label: "Estudio" },
  { value: "Jardín", img: "...", label: "Jardín" },
  { value: "Lavandería", img: "...", label: "Lavandería" },
  { value: "Oficina", img: "...", label: "Oficina" },
  { value: "Patio", img: "...", label: "Patio" },
  { value: "Recámara", img: "...", label: "Recámara" },
  { value: "Sala", img: "...", label: "Sala" },
  { value: "Techo", img: "...", label: "Techo / Azotea" },
  { value: "Otros", img: "...", label: "Bodega" },  // ⚠️ Se convierte en "Bodega"
]
```

### Mapeo de Locations a Rooms

| Location Value | Room Key | Room Label | treat as "Bodega"? | GardenSVG
|----------------|---------|------------|-------------------|-------------------|
| Balcón | balcony | Balcón | No | public\virtualGarden\standard\rooms |
| Baño | bathroom | Baño | No | public\virtualGarden\standard\rooms |
| Cocina | kitchen | Cocina | No | public\virtualGarden\standard\rooms |
| Comedor | dining | Comedor | No | public\virtualGarden\standard\rooms |
| Entrada | entrance | Entrada | No | public\virtualGarden\standard\rooms |
| Estudio | study | Estudio | No | public\virtualGarden\standard\rooms |
| Jardín | garden | Jardín Exterior | No | public\virtualGarden\standard\rooms |
| Lavandería | laundry | Lavandería | No | public\virtualGarden\standard\rooms |
| Oficina | office | Oficina | No | public\virtualGarden\standard\rooms |
| Patio | patio | Patio | No | public\virtualGarden\standard\rooms |
| Recámara | bedroom | Recámara | No | public\virtualGarden\standard\rooms |
| Sala | living | Sala | No | public\virtualGarden\standard\rooms |
| Techo | roof | Techo / Azotea | No | public\virtualGarden\standard\rooms |
| **Otros** | **storage** | **Bodega** | ✅ **SÍ** | public\virtualGarden\standard\rooms |

> **Nota**: La ubicación "Otros" se renombra a "Bodega" semanticamente. Es donde van plantas secundarias, de emergencia, o en recuperación.

---

## 3. MAPEO DE DATOS A VISUALES

### Por cada Room

| Tipo de Item | Representación Visual | Condición |
|--------------|------------------------|-----------|
| **Plant (alive)** | Maceta con ícono de planta según `plantType` | `deleted_at: null` |
| **Plant (eliminated)** | ❌ No aparece | `deleted_at: not null` |
| **Propagation (Activa)** | Semilla/seedling en maceta pequeña | `status === 'Activo'` |
| **Propagation (Trasplantada)** | Se mueve a planta | `status === 'Trasplantada'` |
| **Propagation (Éxito/Fracaso)** | ❌ No aparece | `status !== 'Activo'` |

### Representación de Planta en Room

```tsx
// Cada planta se renderiza como un "plant-badge" en el room
<PlantBadge
  plantType={plant.plantType}     // "Monstera", "Cactus", etc.
  potType={plant.potType}       // "Barro", "Plástico", etc.
  tier={user.tier}             // "standard" | "premium"
  size="small"                 // 32x32px en grid de room
/>
```

### Iconografía por Plant Type

```
PLANT_TYPES → SVG icons en /virtualGarden/standard/plants/
- generic.svg  (fallback)
- monstera.svg
- alocasia.svg
- cactus.svg
- flower.svg
- aromatic.svg
- etc.

Tier premium → /virtualGarden/premium/plants/
```

---

## 4. GARDEN VIEW LAYOUT

```
┌─────────────────────────────────────────────────────────────┐
│  🌱 Mi Jardín                             [Skins por Room]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   BALCÓN     │  │    SALA      │  │    COCINA    │       │
│  │  ┌──┐ ┌──┐   │  │  ┌──┐ ┌──┐   │  │   ┌──┐       │       │
│  │  │🌿│ │🌿│  │  │  │🌿│ │🌿│  │  │  │🌿 │       │       │
│  │  └──┘ └──┘   │  │  └──┘ └──┘  │  │   └──┘        │       │
│  │  [3 plants]  │  │  [5 plants] │  │   [1 plant]   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    BAÑO      │  │  RECÁMARA    │  │   BODEGA     │       │
│  │   ┌──┐       │  │  ┌──┐ ┌──┐   │  │  [sin uso]   │       │
│  │   │🌿│       │  │  │🌿│ │🌿│  │  │              │       │
│  │   └──┘       │  │  └──┘ └──┘   │  │              │       │
│  │  [1 plant]   │  │  [2 plants]  │  │  [0 plants]  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                             │
│  _________________________________________________________  │
│  💡 Tu hogar tiene 12 plantas en 7 habitaciones             │
└─────────────────────────────────────────────────────────────┘
```

### Grid Layout

```css
.garden-rooms-grid {
  display: grid;
  /* Mobile: 1-2 columns */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Desktop: 3-4 columns */
@media (min-width: 1024px) {
  grid-template-columns: repeat(3, 1fr);
}

/* Cada room card es clickeable */
.room-card {
  aspect-ratio: 4/3;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.room-card:hover {
  transform: scale(1.02);
}
```

---

## 5. ROOM CARD ESTRUCTURA

### Componentes por Room

```tsx
<RoomCard locationKey="living" title="Sala">
  {/* Room Skin Background */}
  <RoomBackground skinId={roomSkins.sala} />

  {/* Plant Grid dentro del room */}
  <div className="room-plants-grid">
    {plantsInRoom.map(plant => (
      <PlantBadge key={plant.id} plant={plant} size="small" />
    ))}
  </div>

  {/* Room Stats Footer */}
  <RoomStats>
    <span>{plantCount} plantas</span>
  </RoomStats>
</RoomCard>
```

### Plant Badge

```tsx
// Componente small que muestra planta en room
<PlantBadge plant={Plant} size="small">
  <img
    src={getPlantIcon(plant.plantType, plant.tier)}
    alt={plant.name}
    width={32}
    height={32}
  />
  <Tooltip>{plant.name}</Tooltip>
</PlantBadge>
```

---

## 6. SKINS POR ROOM (Monetización)

### Concepto

Cada **room** puede tener su propio diseño/skin independientemente. El usuario puede comprar un skin para "Sala" y otro diferente para "Cocina".

### Estructura de Datos

```typescript
// En user metadata de Supabase
{
  room_skins: {
    living: "modern",      // Skin ID para Sala
    kitchen: "rustic",    // Skin ID para Cocina
    bedroom: "minimal",    // Skin ID para Recámara
    // ... otros rooms
  },
  unlocked_skins: ["basic", "modern", "rustic", "minimal", "zen"],
  skin_purchased_at: "2024-01-01"
}
```

### Estructura de Carpetas de Assets

```
public/
└── virtualGarden/      → Garden assets (SVGs)
    ├── standard/       → Versiones gratuitas (free)
    │   ├── rooms/      → Fondos de rooms
    │   ├── pots/       → Macetas
    │   └── plants/     → Plantas visuales
    │
    └── premium/        → Versiones de pago (paid)
        ├── rooms/      → Fondos de rooms premium
        ├── pots/       → Macetas premium
        └── plants/     → Plantas premium
```

### Helper de Skins

```typescript
// getRoomSkin.ts
function getRoomSkin(user: User, roomKey: string): RoomSkin {
  const skins = user.raw_app_meta_data?.room_skins || {};
  const skinId = skins[roomKey] || 'room_default';
  return getSkinById(skinId);
}

function getRoomBackground(user: User, roomKey: string): string {
  const skin = getRoomSkin(user, roomKey);
  const tier = user.tier || 'standard';

  // Si es premium y no lo tiene comprado, fallback
  if (skin.premium && !hasPurchasedSkin(user, skin.id)) {
    return `/virtualGarden/standard/rooms/default.svg`;
  }

  return `/virtualGarden/${tier}/rooms/${skin.background}`;
}
```

### Skin Selector Modal

```tsx
// Por cada room, el usuario puede cambiar su skin
<RoomCard locationKey="living">
  <SkinButton onClick={() => openSkinSelector("living")} />
</RoomCard>

// SkinSelector.tsx
<Modal title="Diseña tu Sala">
  <SkinGrid
    skins={ALL_SKINS}
    currentSkin={roomSkins.living}
    onSelect={(skinId) => purchaseOrSelectSkin("living", skinId)}
  />
</Modal>
```

---

## 7. INTERACCIÓN

### Click en Room → Ver Plantas de ese Cuarto

```
UsuarioHaceClick(room card)
    → Filtrar plantas por location
    → Mostrar modal con lista de plantas en ese cuarto
    → Cada planta clickeable → detalle en /plants
```

### Click en Planta en Room → Detalle Rápido

```
UsuarioHaceClick(plantBadge en room)
    → Mostrar tooltip con:
        ├── Nombre de planta
        └── Días desde último riego
    → Click en tooltip → ir a detalles en /plants
```

### Modal Plant List por Room

```tsx
<Modal name="room-plants" title={roomLabel}>
  <PlantListInRoom plants={plants.filter(p => p.location === roomKey)}>
    <PlantRow>
      <PlantIcon />
      <PlantName />
      <LastWateredBadge />
    </PlantRow>
  </PlantListInRoom>

  <Link href={`/plants?location=${roomKey}`}>
    Ver todas las {plantCount} plantas →
  </Link>
</Modal>
```

---

## 8. COMPONENTES A IMPLEMENTAR

### Estructura de Componentes

```
src/components/garden/
├── GardenPage.tsx           // Main container + grid de rooms
├── RoomCard.tsx            // Individual room card
├── RoomGrid.tsx           // Grid wrapper
├── RoomBackground.tsx     // Skin/background del room
├── RoomPlantsGrid.tsx    // Grid de plantas dentro del room
├── PlantBadge.tsx       // Small plant icon en room
├── RoomModal.tsx        // Modal con plantas del room
├── SkinSelector.tsx     // Modal para elegir skin del room
└── SkinButton.tsx      // Botón para abrir skin selector
```

### Rutas

```
/garden                 // Vista principal
/garden/:roomKey       // (futuro) Vista individual de un room
```

---

## 9. IMPLEMENTATION CHECKLIST

- [ ] 1. Crear estructura de componentes garden/
- [ ] 2. Importar PLANT_LOCATIONS del catalog
- [ ] 3. Mapear locations a room keys (Otros → Bodega)
- [ ] 4. Renderizar RoomCard por cada location con plantas
- [ ] 5. Filtrar plantas por location en tiempo real
- [ ] 6. Mostrar PlantBadge según plant.plantType
- [ ] 7. Click en Room → Modal con lista de plantas
- [ ] 8. Click en planta → Tooltip + link a /plants
- [ ] 9. Grid responsive (1-4 columnas)
- [ ] 10. Animaciones de hover/click
- [ ] 11. Basic room skins (default, modern)
- [ ] 12. Skin selector UI por room
- [ ] 13. Estructura para compra de skins
- [ ] 14. Unlock skin en purchase success

---

## 10. ESTRUCTURA DE DATOS EN STORE

```typescript
// plantStore tiene plants[]
// cada plant tiene: location (string)

// Para el Garden, necesitamos:
const plantsByLocation = plants.reduce((acc, plant) => {
  if (!plant.deleted_at) {
    const room = plant.location === 'Otros' ? 'storage' : plant.location;
    (acc[room] = acc[room] || []).push(plant);
  }
  return acc;
}, {} as Record<string, Plant[]>);

// roomSkins en authStore o user metadata
const $roomSkins = map<Record<string, string>>({
  living: 'room_default',
  kitchen: 'room_default',
  // etc
});
```

---

## 11. NOTAS

- **Room sin plantas**: Se muestra vacío con mensaje motivador "¡Agregá tu primera planta!"
- **Bodega**: Es un room especial para plantas en "Otros". Se muestra como cuarto de almacenamiento.
- ** skins son por room**: Independientes entre sí. Cada room puede tener diseño distinto.
- **Es responsive**: Mobile = 1-2 columnas, Desktop = 3-4 columnas
- **Cada planta clickeable**: Link directo a la planta real en /plants
- **Groundwork para decoraciones**: Arquitectura acepta añadir macetas/pots different later

---

## 12. PRECIOS RECOMENDADOS (Skins por Room)

| Skin | Precio USD |
|------|------------|
| Basic / Default | $0 |
| Modern | $0 |
| Rustic | $1 |
| Minimal | $1 |
| Zen | $2 |
| Tropical | $2 |
| Cottage | $2 |

Por qué $1-2? Low friction, impulse buy, cada room es independiente.

Total potencial por usuario completo: 14 rooms × $2 = $28
(pero la mayoría va a usar solo 4-6 rooms y skins básicos)

---

## 13. PLAN DE DESARROLLO

### Fases del Proyecto

El desarrollo está dividido en 4 fases para entregar valor incrementally:

| Fase | Meta | Entregable |
|------|------|------------|
| **Fase 1** | Core funcional | Ver plantas por room sin skins |
| **Fase 1.5** | Interacción básica | Click en room → modal, click en planta → detalles |
| **Fase 2** | UI mejorada | Room cards con diseño, empty states |
| **Fase 3** | Skins básica | cambio de skin por room (gratis) |
| **Fase 4** | Monetización | Compra de skins premium |

---

### Fase 1: Core Funcional (MVP)

**Objetivo**: Que el usuario vea sus plantas organizadas por cuarto.

#### Paso 1.1: Datos — Agrupar plantas por location

```
[✓] Estado existente: plantStore tiene plants[]
[NUEVO] Necesitamos: plantsByLocation: Record<string, Plant[]>

// Helper en store o componente:
const getPlantsByLocation = (plants: Plant[]) =>
  plants.reduce((acc, plant) => {
    if (!plant.deleted_at) {
      const location = plant.location === 'Otros' ? 'Bodega' : plant.location;
      (acc[location] ??= []).push(plant);
    }
    return acc;
  }, {} as Record<string, Plant[]>);
```

- **Por qué primero?**: Es lógica de datos pura. No hay UI, no puede romper.
- **Dónde vive**: puede ser un helper exported o en el componente directamente.
- **Regla**: "Otros" se mapea a "Bodega"

#### Paso 1.2: Componente GardenPage — Grid de rooms

```
// GardenPage.tsx
import { PLANT_LOCATIONS } from '@/data/catalog';
import { useStore } from '@nanostores/react';
import { $store } from '@/store/plantStore';

export default function GardenPage() {
  const storeData = useStore($store);
  const plants = storeData.plants || [];
  const plantsByLocation = useMemo(
    () => getPlantsByLocation(plants),
    [plants]
  );

  return (
    <div className="garden-page">
      <h1>Mi Jardín</h1>
      <div className="garden-rooms-grid">
        {PLANT_LOCATIONS.map(loc => (
          <RoomCard
            key={loc.value}
            location={loc.value}
            label={loc.label === 'Otros' ? 'Bodega' : loc.label}
            plants={plantsByLocation[loc.value] || []}
          />
        ))}
      </div>
    </div>
  );
}
```

- **Por qué segundo?**: Basic structural component. Solo rendering, sin interacción.
- **Dependencias**: Solo store + catalog (ya existen)
- **Regla**: Usar PLANT_LOCATIONS directo, no hardcodear rooms

#### Paso 1.3: Componente RoomCard — Basic

```
// RoomCard.tsx (basic, sin skin)
interface RoomCardProps {
  location: string;    // "Sala", "Cocina", etc.
  label: string;       // Display label
  plantCount: number;
}

export function RoomCard({ location, label, plantCount }: RoomCardProps) {
  return (
    <div className="room-card" data-location={location}>
      <div className="room-header">
        <span className="room-label">{label}</span>
        <span className="room-count">{plantCount} plantas</span>
      </div>
      <div className="room-visual">
        {/* Placeholder visual sementara - depois melhor */}
        <span className="room-empty-text">
          {plantCount === 0 ? 'Sin plantas' : `${plantCount} plantas`}
        </span>
      </div>
    </div>
  );
}
```

- **Por qué tercero?**: Requiere que GardenPage exista para renderizarlo.
- **Estilo mínimo**: Solo mostrar count y label.
- **No skin todavía**: Ese es Fase 2+

#### Paso 1.4: Estilos CSS básicos

```
/* CSS básico para grid */
.garden-page {
  padding: 1rem;
}

.garden-rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.room-card {
  aspect-ratio: 4/3;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  padding: 1rem;
  background: var(--background);
}
```

- **Por qué cuarto?**: El CSS es independientes, puede agregarse después.
- **Meta**: Que se vea presentable pero básico.

#### Entregable Fase 1

```
✓ getPlantsByLocation() helper
✓ GardenPage con grid de rooms
✓ RoomCard básico
✓ CSS básico
✓ Page accesible en /garden
```

---

### Fase 1.5: Interacción Básica

**Objetivo**: Que hacer click en room/plants haga algo útil.

#### Paso 1.5.1: Click en Room → ver plantas del room

```
// RoomCard.tsx — agregar onClick
export function RoomCard({ location, label, plants }: RoomCardProps) {
  const router = useRouter();

  const handleClick = () => {
    // Ir a /plants con filtro de location
    router.push(`/plants?location=${location}`);
  };

  return (
    <div className="room-card" onClick={handleClick}>
      {/* ... */}
    </div>
  );
}
```

- **Por qué?**: El usuario puede navegar rápido a /plants con filtro.
- **Alternativa**: Mostrar modal con plantas (más work, puede esperar).

#### Paso 1.5.2: Tooltip en hover de planta (futuro)

```
// Esto requiere que la planta se muestre visualmente en el room
// De momento, el room solo muestra count.
// Hover de planta específica viene en Fase 2 cuando植)= 
```

- **Nota**: Por ahora, room-click → /plants es suficiente.

---

### Fase 2: UI Mejorada

**Objetivo**: Que los rooms se vean bien y motivadores.

#### Paso 2.1: RoomCard con diseño visual

```
// RoomCard.tsx — diseño mejorado
export function RoomCard({ location, label, plants }: RoomCardProps) {
  return (
    <div className="room-card" data-location={location}>
      {/* Room background SVG */}
      <img
        src={`/virtualGarden/standard/rooms/${location}.svg`}
        alt={label}
        className="room-bg"
      />

      {/* Preview de plantas (solo primeros 4) */}
      <div className="room-plants-preview">
        {plants.slice(0, 4).map(plant => (
          <PlantMiniIcon key={plant.id} type={plant.plantType} />
        ))}
        {plants.length > 4 && <span>+{plants.length - 4}</span>}
      </div>

      {/* Stats footer */}
      <div className="room-footer">
        <span>{plants.length} plantas</span>
      </div>
    </div>
  );
}
```

- **Por qué?**: Ahora hay algo visual interesante.
- **Room backgrounds**: `/virtualGarden/standard/rooms/{location}.svg`

#### Paso 2.2: Empty states motivadores

```
// RoomCard — empty state
{plants.length === 0 ? (
  <div className="room-empty">
    <p>¡Agregá tu primera planta!</p>
    <Link href={`/plants?location=${location}&new=true`}>
      + Añadir planta
    </Link>
  </div>
) : (
  /* planta preview grid */
)}
```

- **Por qué?**: Motivación para agregar más.
- **Mensaje**: vary por location? Por ahora genérico OK.

#### Paso 2.3: PlantMiniIcon component

```
// PlantMiniIcon.tsx
interface PlantMiniIconProps {
  type: string;  // "Monstera", "Cactus", etc.
}

export function PlantMiniIcon({ type }: PlantMiniIconProps) {
  const iconPath = `/virtualGarden/standard/plants/${type.toLowerCase()}.svg`;
  return <img src={iconPath} alt={type} width={24} height={24} />;
}
```

- **Source**: `/virtualGarden/standard/plants/{type}.svg`
- **Fallback**: `/virtualGarden/standard/plants/generic.svg`

---

### Fase 3: Skins Básico (Gratis)

**Objetivo**: Usuario puede cambiar el "theme" de cada room.

#### Paso 3.1: Estructura de room skins en store

```
// gardenStore.ts (nuevo)
import { map } from 'nanostores';

export const $roomSkins = map<Record<string, string>>({});

export const ROOM_SKINS = [
  { id: 'default', name: 'Básico', price: 0 },
  { id: 'modern', name: 'Moderno', price: 0 },
  { id: 'minimal', name: 'Minimalista', price: 0 },
];
```

- **Por qué en nanostores?**: Los stores ya usan nanostores. Persiste al cerrar sesión NO (por ahora).
- **Alternativa**: user metadata (persiste pero más complejo). Por ahora nanostores OK.

#### Paso 3.2: RoomCard con skin prop

```
// RoomCard.tsx
interface RoomCardProps {
  location: string;
  label: string;
  plants: Plant[];
  skinId?: string;  // nuevo
}

export function RoomCard({ skinId = 'default', ...props }: RoomCardProps) {
  return (
    <div className={`room-card room-skin-${skinId}`}>
      {/* contenido */}
    </div>
  );
}
```

- **Default skin**: 'default' si no hay skin seleccionado.
- **CSS**: `.room-skin-default`, `.room-skin-modern`, etc.

#### Paso 3.3: UI para cambiar skin

```
// RoomCard — agregar botón de skin
<button
  className="skin-selector-btn"
  onClick={(e) => {
    e.stopPropagation();
    openSkinSelector(location);
  }}
>
  🎨
</button>

// Esto abre un modal simple con las 3 opciones de skin
```

- **Skis incluidos**: default, modern, minimal (todos $0).
- **El clickea el ícono, abre modal, selecciona skin.**

---

### Fase 4: Monetización (Premium Skins)

**Objetivo**: Usuario puede comprar skins premium.

#### Paso 4.1: Añadir skins premium al catálogo

```
export const ROOM_SKINS = [
  // Gratuitas (Fase 3)
  { id: 'default', name: 'Básico', price: 0 },
  { id: 'modern', name: 'Moderno', price: 0 },
  { id: 'minimal', name: 'Minimalista', price: 0 },

  // Premium
  { id: 'rustic', name: 'Rústico', price: 1 },
  { id: 'zen', name: 'Zen', price: 2 },
  { id: 'tropical', name: 'Tropical', price: 2 },
];
```

#### Paso 4.2: Verificar si tiene skin premium

```
// Helper para verificar compra
function hasSkinAccess(user: User, skinId: string): boolean {
  const skin = getSkinById(skinId);
  if (skin.price === 0) return true;
  return user.unlocked_skins?.includes(skinId);
}
```

#### Paso 4.3: UX compra de skin premium

```
// SkinSelector.tsx
<button
  disabled={!hasAccess}
  onClick={() => {
    if (skin.price > 0) {
      // Abrircheckout
      openCheckout(skin.id, 'room_skin');
    }
  }}
>
  {hasAccess ? 'Aplicar' : `Comprar $${skin.price}`}
</button>
```

- ** Checkout**: Por ahora placeholder (integración Stripe viene después)
- **No bloquea**: Si no tiene acceso, muestra "Comprar" en vez de "Aplicar"

---

### RESUMEN: Orden de Desarrollo

| # | Paso | Qué | Dependencias | Dificult |
|----|------|-------------|----------|---------|
| 1.1 | getPlantsByLocation() | plantStore | None | Baja |
| 1.2 | GardenPage + grid | catalog, store | 1.1 | Baja |
| 1.3 | RoomCard básico | — | 1.2 | Baja |
| 1.4 | CSS básico | — | 1.3 | Baja |
| 1.5 | Click → /plants | router | 1.4 | Baja |
| 2.1 | RoomCard visual | icons | 1.4 | Media |
| 2.2 | Empty states | 2.1 | Baja |
| 2.3 | PlantMiniIcon | icons | 2.1 | Media |
| 3.1 | $roomSkins store | nanostores | 2.x | Media |
| 3.2 | RoomCard + skin prop | 3.1 | Baja |
| 3.3 | Skin selector UI | 3.2 | Media |
| 4.1 | Añadir premium | 3.3 | Baja |
| 4.2 | hasSkinAccess() | 4.1 | Media |
| 4.3 | Checkout UI | 4.2 | Alta |

---

### Reglas del Desarrollo

1. **No romper lo existente**: Cada fase agrega, no modifica funcionalidad anterior de plantas.
2. **Datos vienen del catálogo**: No hardcodear locations. Usar PLANT_LOCATIONS.
3. **"Otros" → Bodega**: mappear siempre, no crear location "Bodega" en catálogo.
4. **UI exists in components/**: New folder `components/garden/`.
5. **CSS lives in existing CSS**: No crear nuevos CSS files. Put in `components/garden/Garden.module.css` or similar.
6. **Store usa nanostores**: Mismo patrón que otros stores. No zustand, no context.
7. **Assets vienen de /virtualGarden/**: Todos los SVGs del garden van en `public/virtualGarden/` (standard y premium).
8. **Skin selector es modal**: No nueva page, solo modal overlay.

---

### Dependencies Externas

| Dependencia | Para qué | Status |
|------------|---------|--------|
| @nanostores/react | useStore en componentes | ✅ Ya existe |
| PLANT_LOCATIONS | Zonas disponibles | ✅ Ya existe |
| plantStore | Datos de plantas | ✅ Ya existe |
| useRouter | Navegación | ✅ Ya existe (next/navigation) |
| next/link | Links | ✅ Ya existe |

---

### Archivos a Crear/M Modificar

| Archivo | Acción | Fase |
|---------|--------|------|
| `src/components/garden/GardenPage.tsx` | NUEVO | 1 |
| `src/components/garden/RoomCard.tsx` | NUEVO | 1 |
| `src/components/garden/PlantMiniIcon.tsx` | NUEVO | 2 |
| `src/components/garden/SkinSelector.tsx` | NUEVO | 3 |
| `src/store/gardenStore.ts` | NUEVO | 3 |
| `src/app/(pages)/garden/page.tsx` | MODIFICAR | 1 |
| `src/styles/globals.css` | MODIFICAR | 1-2 |

---

### Estimación de Esfuerzo

| Fase | Tiempo Estimado | Razón |
|------|----------------|-------|
| Fase 1 | 1-2 horas | Solo UI básica + datos |
| Fase 1.5 | 30 min | Click handler básico |
| Fase 2 | 2-3 horas | Más UI, icons, empty states |
| Fase 3 | 2-3 horas | Store + selector UI |
| Fase 4 | 3-4 horas | Checkout + premium logic |

**Total estimado**: ~9-12 horas para feature completo.
**MVP (Fase 1)**: Solo 1-2 horas.