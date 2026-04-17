# 🌿 PlantitasApp

**PlantitasApp** es una app web para amantes de las plantas. Registrá tu colección, llevá el historial de cuidados, gestioná propagaciones, inventario de insumos y mucho más — sin fricción, desde cualquier dispositivo.

Funciona **sin cuenta**: tus datos viven en el navegador y los exportás como JSON cuando quieras. Si querés respaldo automático en la nube, existe el plan Premium.

---

## ¿Cómo funciona?

### Sin cuenta — Plan Gratuito 🌱

Podés usar PlantitasApp al 100% sin registrarte. No hay límite de plantas ni funciones bloqueadas.

- Todo se guarda en `localStorage` del navegador
- Exportá tus datos como `.json` cuando quieras (botón **Exportar** en el header)
- Importá un JSON anterior para restaurar o migrar datos entre dispositivos
- Si el botón muestra **⚠ Cambios pendientes**, es hora de hacer una copia

> Los datos son tuyos. PlantitasApp no envía nada a ningún servidor si no tenés una cuenta activa.

### Con cuenta — Plan Premium ☁

Al iniciar sesión con una cuenta Premium (o Master Admin), los datos se sincronizan automáticamente con la nube vía **Supabase**.

- El sync es transparente: cada vez que modificás algo, se guarda en la nube en segundo plano
- Un indicador en el header muestra el estado: `☁` sincronizado · `⟳` sincronizando · `⚠` error
- Podés usar la app desde múltiples dispositivos y los datos se mantienen consistentes
- Los registros eliminados no se borran permanentemente — van a una **papelera** recuperable desde tu perfil

| | Gratuito 🌱 | Premium ☁ |
|---|---|---|
| Todas las funciones de la app | ✅ | ✅ |
| Datos locales (localStorage) | ✅ | ✅ |
| Exportar / Importar JSON | ✅ | ✅ |
| Sincronización en la nube | ❌ | ✅ |
| Acceso multi-dispositivo | ❌ | ✅ |
| Papelera de registros eliminados | ❌ | ✅ |
| Perfil editable (nombre, teléfono) | ✅ | ✅ |

---

## Funcionalidades

### 🌱 Mis Plantas
Registrá cada planta con nombre, tipo, ícono, ubicación, luz y tipo de maceta. Cada planta tiene su **historial de logs**:

- Riego, fertilización, sustrato, trasplante, plagas/enfermedades y más
- La fecha del último riego se actualiza automáticamente
- Panel de detalle lateral en desktop, bottom sheet en mobile

### 🧪 Propagación (Vivero)
Seguimiento completo del ciclo de vida de tus esquejes y semillas:

- Vinculá cada propagación con su planta madre
- Métodos: agua, sustrato, musgo, etc.
- Estados: Activo → Trasplantada / Fracaso

### 📅 Planeación Anual
Organizá tareas de cuidado por estación (Primavera, Verano, Otoño, Invierno):

- Tipos: Riego, Fertilización, Poda, Siembra, Limpieza, Tratamiento, etc.
- Ordenable por tipo o descripción

### 📦 Inventario de Insumos
Control de stock para lo que usás en tu jardín:

- Categorías: Sustratos, Fertilizantes, Polvos, Líquidos, Medicamentos, Otros
- Ajuste de cantidad con botones `+` / `−`
- Al registrar un log de mantenimiento, el inventario valida el stock disponible

### ✨ wishlist
Tu Lista de Deseos de plantas, artículos y más. Prioridad Alta / Media / Baja con notas.

### 📝 Notas Globales
Notas libres sin estructura, para apuntes rápidos, observaciones o ideas.

### 🔍 Buscador Global
Buscador en tiempo real en el header que encuentra plantas, propagaciones e insumos de una sola vez.

---

## Perfil y cuenta

Desde `/profile` podés:

- Editar tu nombre y teléfono
- Ver tu plan actual (Gratuito / Premium / Master Admin)
- Acceder a la **papelera** (solo Premium) — restaurá registros eliminados sin perder historial

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | CSS mobile-first + Tailwind v4 |
| Estado cliente | nanostores |
| Auth | Supabase Auth (email/password) |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Arquitectura CSS | Custom properties + breakpoints 480 / 600 / 768 / 900px |

La arquitectura de datos sigue un modelo **hexagonal**: dominio puro en `src/core/`, adaptadores en `src/libs/`, estado global en `src/store/`.

---

## Desarrollo local

```bash
# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun dev
```

Requiere un archivo `.env.local` con las variables de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Respaldo de datos

Aunque uses el plan gratuito, siempre podés exportar todo tu jardín como JSON desde el botón **Exportar** en el header. El archivo incluye plantas, logs, propagaciones, inventario, wishlist, notas y tareas estacionales.

Para restaurar: usá el botón **Importar JSON** y elegí tu archivo. Podés elegir entre reemplazar los datos actuales o fusionarlos con los existentes.

---

Hecho con dedicación para Erzu, con ideas de Alex, y con vibecode mientras se jugaba Dota — porque YOLO.
