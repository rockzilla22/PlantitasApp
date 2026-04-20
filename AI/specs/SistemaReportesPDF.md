# AI/specs/SistemaReportesPDF.md: Sistema de Generación de Reportes Botánicos

## 1. VISIÓN GENERAL
El **Sistema de Reportes PDF** permite al usuario exportar un documento profesional con el estado actual de toda su gestión botánica. Es un valor agregado para usuarios **PRO** y **PREMIUM** que necesiten un backup físico o compartir el estado de su jardín con otros.

---

## 2. ESTRUCTURA DEL REPORTE

### 2.1 Portada y Resumen Ejecutivo
- **Cabecera**: Nombre del Usuario, Fecha de Generación, Plan Actual.
- **Métricas Globales**:
  - Total de Plantas vivas.
  - Total de Propagaciones en curso.
  - Alerta de Stock Crítico (Insumos en cero o bajo mínimo).
  - Tarea más urgente de la Temporada actual.

### 2.2 Sección: Catálogo de Mi Colección (Pestaña "Mis Plantas")
Una tabla detallada con:
- **Nombre y Variedad**: Nombre de la planta + Subtipo.
- **Ubicación**: Dónde se encuentra (Balcón, Living, etc.).
- **Ficha Técnica**: Nivel de luz, tipo de maceta y si está en dormancia.
- **Estado de Cuidado**: Fecha del último riego y última acción registrada.
- **Historial Reciente**: Mini-lista de los últimos 3 logs por planta.

### 2.3 Sección: Laboratorio de Propagación (Pestaña "Propagación")
- **Resumen de Éxito**: Porcentaje de esquejes/semillas que llegaron a "Éxito".
- **Listado Activo**: 
  - Planta Madre (si aplica).
  - Método (Esqueje, Semilla, etc.).
  - Fecha de Inicio y días transcurridos.
  - Notas de evolución.

### 2.4 Sección: Auditoría de Inventario (Pestaña "Inventario")
Dividido por categorías (Sustratos, Fertilizantes, etc.):
- **Tabla de Existencias**: Nombre del insumo, cantidad actual y unidad.
- **Indicador de Reposición**: Ítems resaltados en rojo si la cantidad es baja.

### 2.5 Sección: Agenda Estacional (Pestaña "Temporada")
- **Contexto Actual**: Estación del año en curso.
- **Checklist de Tareas**: Listado de tareas planificadas para la temporada actual, separando las completadas de las pendientes.

### 2.6 Sección: Proyecciones y Bitácora (Pestañas "Deseos" y "Notas")
- **Lista de Deseos**: Plantas buscadas ordenadas por prioridad (Crítica a Baja).
- **Notas Globales**: Observaciones generales, ideas o recordatorios del usuario (Bitácora de seguimiento).

---

## 3. ESPECIFICACIONES TÉCNICAS (Sugeridas)

### Formato Visual
- Estilo minimalista y "limpio".
- Uso de colores de la marca (Verde Primario).
- Inclusión de iconos pequeños para identificar categorías (riego, luz, etc.).

### Implementación
- **Librería sugerida**: `jspdf` + `jspdf-autotable` o `react-pdf`.
- **Filtros de Exportación**: El usuario debería poder elegir si quiere un reporte completo o solo de una sección (ej: "Solo Inventario").

---

## 4. RESTRICCIONES DE ACCESO
- **Invitado / Free**: Puede ver una "Previsualización" borrosa o un reporte limitado a las primeras 5 plantas.
- **Pro / Premium / Master**: Exportación ilimitada y completa.

---
*Ultima actualización: 19 de Abril, 2026. Basado en la arquitectura de PlantitasApp V5.*
