# Plan de Proyecto: PlantitasApp (Estatus Final v3.2)

Arquitecto de Software Senior: Gemini CLI
Objetivo: SPA Offline-First evolucionada con edición granular, búsqueda global y arquitectura de datos auto-sanable.

## 🛠 ARQUITECTURA TÉCNICA
- **Ejecución:** Local estricta (`file://`). Sin dependencias externas ni módulos.
- **Persistencia:** `localStorage` con **Sanitización Proactiva** (se limpia al cargar y al importar).
- **UI/UX:** Grid dinámico Maestro-Detalle invertido (Lista 300px | Detalle 1fr).
- **Sistema de Diálogos:** Control total vía `<dialog>`. Implementado modal de **Edición Atómica** para modificar cualquier propiedad de las entidades existentes sin pérdida de historial.

## 📊 MODELO DE DATOS (v3.2)
```json
{
  "inventory": {
    "substrates": [{ "name": "string", "qty": number, "unit": "string" }],
    "powders": [{ "name": "string", "qty": number, "unit": "string" }],
    "liquids": [{ "name": "string", "qty": number, "unit": "string" }],
    "others": [{ "name": "string", "qty": number, "unit": "string" }]
  },
  "plants": [{
    "id": timestamp,
    "icon": "string (emoji)",
    "type": "string",
    "name": "string",
    "lastWateredDate": "YYYY-MM-DD",
    "logs": [{ "id": timestamp, "date": "YYYY-MM-DD", "actionType": "string", "detail": "string" }]
  }],
  "globalNotes": [{ "id": timestamp, "content": "string" }]
}
```

## 🚀 FUNCIONALIDADES EVOLUCIONADAS

### 1. Edición Granular (Full Mutability)
- **Modal de Edición:** Permite corregir Nombre, Icono y Tipo de cualquier planta en cualquier momento.
- **Categorización Retroactiva:** Facilita la clasificación de registros antiguos que carecen de metadatos de tipo.

### 2. UI Informativa (Badges)
- **Lista Izquierda:** Cada item muestra un badge con el tipo de planta para reconocimiento rápido.
- **Detalle Derecho:** Header rediseñado con jerarquía clara: Icono + Nombre y Tipo resaltado en badge.

### 3. Motor de Búsqueda Inteligente
- **Filtros Cruzados:** Busca por nombre o por categoría (ej: buscar "Cactus" filtra toda la colección de suculentas).
- **Feedback Visual:** Resultados con iconos reales para navegación intuitiva.

### 4. Integridad de Datos (Self-Healing)
- **Sanitización en Export/Import:** El sistema garantiza que no existan propiedades `null` o `undefined` en el esquema, inyectando fallbacks dinámicos.
- **Migración Silenciosa:** Los datos se actualizan al vuelo durante la inicialización del `store`.

## 📖 DICCIONARIO DE REFERENCIA
- **Tipos Predefinidos:** Philodendron, Alocasia, Monstera, Syngonium, Carnívora, Flor, Cactus, Árbol, Hierba.
- **Acciones de Log:** Riego 💧, Sustrato 🟤, Polvos ⚪, Líquidos 🧪, Humus 🪱, Transplante 🪴, Plaga 🐛, Nota 📝.
- **Inventario:** Categorías con gestión de stock decimal y unidades personalizables.
