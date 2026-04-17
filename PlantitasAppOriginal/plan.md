# Plan de Proyecto: PlantitasApp (Estatus Final v4.0)

Arquitecto de Software Senior: Gemini CLI
Objetivo: Ecosistema Botánico Profesional Offline-First con inteligencia de inventario, layouts dinámicos y feedback proactivo al usuario.

## 🛠 ARQUITECTURA TÉCNICA
- **Ejecución:** Local estricta (`file://`). Arquitectura Vanilla JS pura, sin módulos ni dependencias.
- **Persistencia:** `localStorage` con **Normalización Reactiva** (limpieza y validación estructural en cada carga/importación).
- **UI/UX Dinámica:** 
    - **Panel Maestro-Detalle Redimensionable:** Implementado un "Resizer" dinámico (Drag & Drop) para ajustar el ancho de la lista y el detalle.
    - **Grillas Optimizadas:** Layouts de 2 columnas en Inventario y Planeación para maximizar el espacio vertical.
    - **Diseño Responsivo Adaptativo:** Ocultamiento automático de herramientas complejas (resizer) en dispositivos móviles.
- **Sistema de Feedback:** Animaciones de estado (Flash Amarillo + Glow) para forzar la cultura del backup tras cada modificación de datos.

## 📊 MODELO DE DATOS (v4.0)
```json
{
  "inventory": {
    "substrates": [], "fertilizers": [], "powders": [], 
    "liquids": [], "meds": [], "others": [] 
  },
  "plants": [{
    "id": timestamp, "icon": "emoji", "type": "string", "name": "string",
    "location": "string", "light": "string", "potType": "string", "dormancy": "string",
    "lastWateredDate": "YYYY-MM-DD",
    "logs": [{ "id": timestamp, "date": "YYYY-MM-DD", "actionType": "string", "detail": "string" }]
  }],
  "propagations": [{ "id": timestamp, "parentId": id, "name": "string", "method": "string", "status": "Activo|Éxito|Fracaso" }],
  "wishlist": [{ "id": timestamp, "name": "string", "priority": "Alta|Media|Baja" }],
  "globalNotes": [{ "id": timestamp, "content": "string" }],
  "seasonalTasks": { "Primavera": [], "Verano": [], "Otoño": [], "Invierno": [] }
}
```

## 🚀 FUNCIONALIDADES PROACTIVAS (v4.0)

### 1. Inteligencia de Inventario Cruzada
- **Validación de Stock:** Al registrar una tarea (Sustrato, Fertilizante, Medicina, etc.), la app detecta si hay stock disponible.
- **Nudge de UX:** Si el inventario está vacío, se dispara una notificación inteligente que ofrece "Saltar al Inventario" con la categoría ya pre-seleccionada.
- **Actualización en Tiempo Real:** Los selectores de registros se sincronizan instantáneamente tras añadir nuevos insumos, eliminando la necesidad de F5.

### 2. Gestión de Salud (Farmacia Botánica)
- **Categoría Meds:** Nueva sección para Insecticidas y Medicinas vinculada directamente a la acción de registro "Insecticidas/Medicinas".
- **Emoji Semántico:** Uso de 💊 para medicinas y 🛒 para trasplantes (unificando visualmente la acción de mudanza).

### 3. Integridad y Fusión de Datos
- **Importación Inteligente:** Sistema de resolución de conflictos que permite elegir entre "Unificar" (Merge preventivo) o "Sobreescribir" (Reset total).
- **Protección de Datos:** Recálculo automático de fechas críticas (como `lastWateredDate`) al eliminar registros del historial.

### 4. Localización y Estándares
- **Español Neutro Forzado:** Validación nativa del navegador reescrita para mostrar siempre "Por favor, completa este campo".
- **Iconografía Unificada:** Sistema de mapeo centralizado que asegura que cada acción en cualquier pestaña tenga el mismo identificador visual.

## 📖 DICCIONARIO DE REFERENCIA ACTUALIZADO
- **Acciones Clave:** Riego 💧, Medición 📏, Sustrato 🟤, Fertilizante 🧴, Polvos ⚪, Líquidos 🧪, Insecticidas/Medicinas 💊, Trasplante 🛒, Plaga 🐛, Nota 📝.
- **Métodos de Propagación:** Agua 💧, Sustrato 🟤, Acodo 🌳, Semilla 🌱.
- **Prioridades:** Alta 🔥, Media, Baja.
