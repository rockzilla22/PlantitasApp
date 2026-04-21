# AI/specs/INFO_SPEC.md: Enciclopedia - Buscador de Plantas

## 1. VISIÓN GENERAL

**Enciclopedia** es un sistema de búsqueda híbrida que combina:
- **Mis Plantas**: Registros propios del usuario (plantas que ya tiene registradas)
- **Enciclopedia**: Información de Wikipedia en español + base propia

### Objetivos

- Buscador unificado para plantas propias + info externa
- Preview rápido sin salir de la app
- Integración con el Foro para discutir información

---

## 2. UI/UX STRUCTURE

### 2.1 Panel de Búsqueda (Modal/Global)

```
┌──────────────────────────────────────────────────────┐
│  🔍 Buscar plantas o información...              [X]  │
├────────────────────┬──────────────────────────────────┤
│  🌱 MIS PLANTAS   │  📖 ENCICLOPEDIA               │
│                  │                               │
│  ┌────────────┐  │  ┌────────────────────┐       │
│  │ Monstera   │  │  │ Monstera         │       │
│  │ Sala      │  │  │ Deliciosa       │       │
│  │ [Ir →]   │  │  │ [Ver más]       │       │
│  └────────────┘  │  └────────────────────┘       │
│                  │                               │
│  [+Resultado]   │  [+Resultado]              │
│                  │                               │
├────────────────────┴──────────────────────────────────┤
│  🔥 Más buscados global:                          │
│  [Monstera] [Ficus] [Potus] [Suculenta]          │
│                                                     │
│  🔥 Tus búsquedas:                                │
│  [Potus] [Gato]                                 │
└──────────────────────────────────────────────────────┘
```

### Layout Técnical

```css
.search-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  max-height: 70vh;
  overflow-y: auto;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  max-height: 50vh;
}
```

---

## 3. DATA SOURCES

### 3.1 Mis Plantas (propios registros)

```typescript
interface PlantResult {
  source: 'my_plants';
  id: string;
  name: string;
  location: string;
  type: string;
  lastWatered?: string;
}
```

### 3.2 Enciclopedia (Wikipedia + Base Propia)

```typescript
interface EncyclopediaResult {
  source: 'encyclopedia';
  title: string;
  displayName: string;       // "Monstera Deliciosa"
  scientificName: string;  // "Monstera deliciosa"
  summary: string;         // Primer párrafo
  imageUrl?: string;
  wikipediaUrl: string;
  category: string;        // "Planta de interior", "Tropical", etc.
}
```

### 3.3 Fuente Híbrida

```typescript
// Combina ambos
type SearchResult = PlantResult | EncyclopediaResult;

// En la búsqueda
const results = await Promise.all([
  searchMyPlants(query),           // Busca en mis plantas
  searchEncyclopedia(query),     // Busca Wikipedia ES
]);
```

---

## 4. BUSCADOR EXISTENTE + WIKIPEDIA

### 4.1 Integración con Buscador Actual

El buscadores actual ya funciona para:
- Nombre de planta
- Tipo (Monstera, Cactus, etc.)
- Subtipo
- Descripciones

**Nueva funcionalidad**: Agregar búsqueda de Wikipedia ES cuando no encuentra en mis plantas.

### 4.2 Búsqueda Wikipedia

```typescript
// API: Wikipedia ES
const WIKIPEDIA_API = 'https://es.wikipedia.org/w/api.php';

interface WikipediaSearchParams {
  action: 'query';
  list: 'search';
  srsearch: string;
  srlimit: number;        // 15 por página
  format: 'json';
  origin: '*';           // CORS
}

async function searchWikipedia(query: string): Promise<WikipediaResult[]> {
  const url = `${WIKIPEDIA_API}?${new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: '15',
    format: 'json',
    origin: '*',
  })}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.query.search.map(item => ({
    title: item.title,
    pageId: item.pageid,
    snippet: item.snippet.replace(/<[^>]*>/g, ''), // Strip HTML
  }));
}
```

### 4.3 Obtener Detail (Preview)

```typescript
async function getWikipediaDetail(pageId: string): Promise<WikipediaDetail> {
  const url = `${WIKIPEDIA_API}?${new URLSearchParams({
    action: 'query',
    pageids: pageId,
    prop: 'extracts|pageimages',
    exintro: true,
    explaintext: true,
    piprop: 'thumbnail',
    pithumbsize: 300,
    format: 'json',
    origin: '*',
  })}`;

  const response = await fetch(url);
  const data = await response.json();
  const page = data.query.pages[pageId];

  return {
    title: page.title,
    extract: page.extract,
    thumbnail: page.thumbnail?.source,
    pageUrl: `https://es.wikipedia.org/wiki/${page.title}`,
  };
}
```

---

## 5. PREVIEW MODAL

### 5.1 UI del Preview

```
┌──────────────────────────────────────────────────┐
│  Monstera Deliciosa                    [X]       │
├──────────────────────────────────────────────────┤
│  ┌────────────────┐                           │
│  │                │  Nombre científico:         │
│  │   [Foto]       │  Monstera deliciosa        │
│  │   200x200     │  Familia: Araceae        │
│  │                │                           │
│  └────────────────┘  Temperatura:        │
│                       18-30°C               │
│                       Luz: Indirecta        │
│                       Riego: Semanal        │
├──────────────────────────────────────────────────┤
│  Descripción:                              │
│  La Monstera deliciosa es una especie      │
│  de planta trepadora originaria de...     │
│  [+Leer más en Wikipedia]                │
├──────────────────────────────────────────────────┤
│  [+Discutir]  [+Cerrar]                      │
└──────────────────────────────────────────────────┘
```

### 5.2 Componente PreviewModal

```tsx
interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantData: WikipediaDetail;
}

export function PreviewModal({ isOpen, onClose, plantData }: PreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal preview-modal" onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>{plantData.title}</h2>
          <button onClick={onClose}>×</button>
        </header>

        <div className="preview-content">
          {plantData.thumbnail && (
            <img src={plantData.thumbnail} alt={plantData.title} />
          )}

          <div className="preview-info">
            <p className="scientific">
              <strong>Nombre científico:</strong> {plantData.scientificName}
            </p>
            <p className="extract">{plantData.extract?.slice(0, 300)}...</p>
          </div>
        </div>

        <footer>
          <a
            href={plantData.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Leer más en Wikipedia
          </a>

          <button
            className="btn-primary"
            onClick={() => openForumDiscussion(plantData)}
          >
            Discutir
          </button>
        </footer>
      </div>
    </div>
  );
}
```

---

## 6. INTEGRACIÓN CON FORO ("Discutir")

### 6.1 Flujo

```
Usuario clickea "Discutir"
    → Abre modal de nuevo post en FORUM
    → Pre-carga título, contenido e info
    → Usuario agrega su pregunta/comentario
    → Publica → Aparece en el FORUM
```

### 6.2 Pre-carga del Post

```typescript
// Al abrir el FORUM con pre-carga
interface PreloadedPost {
  title: `Discusión: ${plantName}`;
  content: `Información sobre ${plantName}:\n\n${extract}\n\n---\nMi pregunta/comentario:`;
  tags: [plantName, 'discusion'];
  type: 'discussion';
}
```

### 6.3 Helper

```tsx
async function openForumDiscussion(plantData: WikipediaDetail) {
  // Cerrar preview modal
  closePreviewModal();

  // Abrir nuevo post modal en FORUM
  openNewPostModal({
    title: `Discusión: ${plantData.title}`,
    content: `📖 **Información sobre ${plantData.title}**\n\n${plantData.extract?.slice(0, 500)}...\n\n---\n\n💬 **Mi comentario/pregunta:**\n`,
    tags: [plantData.title, 'discusion'],
    type: 'discussion',
  });
}
```

---

## 7. "MÁS BUSCADOS"

### 7.1 Dos Lists

```typescript
interface PopularSearches {
  global: string[];        // Los más buscados por TODOS los usuarios
  personal: string[];     // Los más buscados por MÍ
}
```

### 7.2 Storage

```typescript
// LocalStorage (por ahora)
const SEARCH_HISTORY_KEY = 'plantitas_search_history';
const POPULAR_SEARCHES_KEY = 'plantitas_popular_searches';

// Agregar búsqueda
function addToSearchHistory(query: string) {
  const history = getLocalSearchHistory();
  const updated = [query, ...history.filter(q => q !== query)].slice(0, 10);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
}

// Popular global (simplificado, sin backend)
function getPopularSearches(): string[] {
  return ['Monstera', 'Ficus', 'Potus', 'Suculenta', 'Gato', 'Palmera'];
}
```

---

## 8. PLAN DE DESARROLLO (HIper-seccionado)

| Etapa | Enfoque | Entregable |
|------|---------|----------|
| **A** | Buscador actual + Wikipedia | Búsqueda combinada |
| **B** | Panel 2 columnas | UI básica |
| **C** | Preview modal | Detail card |
| **D** | "Discutir" → Forum | Integración |
| **E** | "Más buscados" | Historial |

---

### ETAPA A: Buscador + Wikipedia

**Objetivo**:扩展 el buscador actual con Wikipedia ES.

#### A1: Helper de Wikipedia

```typescript
// src/libs/wikipedia.ts
export async function searchWikipediaPlants(query: string): Promise<WikipediaResult[]> {
  // API call a Wikipedia ES
}

export async function getPlantDetail(pageId: string): Promise<WikipediaDetail> {
  // Obtener detail con thumbnail
}
```

#### A2: Existing search + Wiki

```typescript
// En el componente de búsqueda actual
async function handleSearch(query: string) {
  // 1. Buscar en mis plantas (existing)
  const myPlants = await searchMyPlants(query);

  // 2. Buscar en Wikipedia (nuevo)
  const wikiResults = await searchWikipediaPlants(query);

  // 3. Combinar
  return { myPlants, wikiResults };
}
```

**Entregable Etapa A**: ✅ Búsqueda que retorna ambos.

---

### ETAPA B: Panel 2 Columnas

**Objetivo**: UI splitada con scroll.

#### B1: Componente SearchPanel

```tsx
interface SearchPanelProps {
  query: string;
  onSearch: (q: string) => void;
}

export function SearchPanel({ query, onSearch }: SearchPanelProps) {
  const { myPlants, wikiResults } = useSearch(query);

  return (
    <div className="search-panel">
      <div className="column my-plants">
        <h3>🌱 Mis Plantas</h3>
        {myPlants.map(plant => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>

      <div className="column encyclopedia">
        <h3>📖 Enciclopedia</h3>
        {wikiResults.map(result => (
          <WikiCard key={result.pageId} result={result} />
        ))}
      </div>
    </div>
  );
}
```

#### B2: CSS

```css
.search-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 50vh;
  overflow-y: auto;
}
```

**Entregable Etapa B**: ✅ Panel con 2 columnas y scroll.

---

### ETAPA C: Preview Modal

**Objetivo**: Card expandido al clickear resultado de Wikipedia.

#### C1: WikiCard clickeable

```tsx
function WikiCard({ result, onClick }: { result: WikiResult; onClick: () => void }) {
  return (
    <div className="wiki-card" onClick={onClick}>
      <span>{result.title}</span>
      <span className="snippet">{result.snippet}</span>
      <button>Ver más</button>
    </div>
  );
}
```

#### C2: PreviewModal (del punto 5)

**Entregable Etapa C**: ✅ Preview modal con info.

---

### ETAPA D: "Discutir" → Forum

**Objetivo**: Integración que abre el FORUM pre-cargado.

```tsx
function PreviewModal({ plantData }) {
  const handleDiscuss = () => {
    // 1. Cerrar este modal
    // 2. Abrir NewPostModal del FORUM con pre-carga
    openForumNewPost({
      title: `Discusión: ${plantData.title}`,
      content: `📖 **Información:**\n${plantData.extract}\n\n💬`,
      tags: [plantData.title],
      type: 'discussion',
    });
  };

  return (
    <button onClick={handleDiscuss}>Discutir</button>
  );
}
```

**Entregable Etapa D**: ✅ Botón "Discutir" funcional.

---

### ETAPA E: "Más Buscados"

**Objetivo**: Mostrar historial y popular.

```tsx
function SearchFooter() {
  return (
    <div className="search-footer">
      <div className="popular-global">
        <span>🔥 Más buscados:</span>
        {POPULAR.map(term => (
          <button onClick={() => onSearch(term)}>{term}</button>
        ))}
      </div>

      <div className="personal-history">
        <span>🔍 Tus búsquedas:</span>
        {getLocalHistory().map(term => (
          <button onClick={() => onSearch(term)}>{term}</button>
        ))}
      </div>
    </div>
  );
}
```

**Entregable Etapa E**: ✅ Historial y popular.

---

## 9. RESUMEN: Orden de Desarrollo

| # | Sub-paso | Qué | Dependencias | Dificult |
|-----|--------|-------------|----------|---------|
| **A1** | Wikipedia helper | None | Baja |
| **A2** | Search combo | A1 | Media |
| **B1** | SearchPanel UI | A2 | Baja |
| **B2** | CSS columns | B1 | Baja |
| **C1** | WikiCard | B2 | Baja |
| **C2** | PreviewModal | C1 | Media |
| **D1** | Forum pre-load | C2 + FORUM | Media |
| **E1** | Popular list | A2 | Baja |
| **E2** | History local | E1 | Baja |

---

### Entregables por Etapa

| Etapa | Entregable | Tiempo |
|------|----------|-------|
| **A** | Búsqueda wiki | 15 min |
| **B** | Panel 2 cols | 15 min |
| **C** | Preview modal | 15 min |
| **D** | Forum link | 15 min |
| **E** | Más buscados | 10 min |

**Total estimado**: ~1 hora

---

## 10. REGLAS

1. **Wikipedia ES**: Solo español para simplificar
2. **Límite**: 15 resultados por search
3. **Sin caché**: No guardar resultados (fetch siemprefresh)
4. **Fallback**: Si no hay resultados, mostrar mensaje
5. **Forum link**: Requires FORUM feature implementado

---

## 11. INTEGRACIONES

| Feature | Cómo conecta |
|---------|--------------|
| **Buscador actual** | Extiende funcionalidad existente |
| **Mis Plantas** | Usa plantStore existente |
| **Forum** | Pre-carga post para discusión |
| **Wikipedia ES** | API pública, sin key necesaria |