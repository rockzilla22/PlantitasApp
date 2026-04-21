# 🌿 PlantitasApp

**El diario de cuidados que todo Plant Lover necesita.**

Sabemos que cada hoja nueva cuenta una historia. PlantitasApp te ayuda a recordar cuándo fue el último riego, cómo va creciendo ese nuevo esqueje y qué cuidados necesita tu colección hoy. Disfrutá de tus plantas sin el estrés de olvidar cuándo tocaba regar o fertilizar. Creá un espacio digital para tu colección, seguí el progreso de tus propagaciones y mantén tus insumos a la mano. Tu única preocupación será verlas crecer.

Funciona **sin cuenta**: tus datos viven en el navegador y los exportás como JSON cuando quieras. Si querés respaldo automático en la nube, existen los planes Premium y Pro.

---

## ¿Cómo funciona?

### Sin cuenta — Plan Gratuito 🌱

Puedes usar PlantitasApp al 100% sin registrarte. Todas las funciones están disponibles.

- Todo se guarda en `localStorage` del navegador
- Exportá tus datos como `.json` cuando quieras (botón **Exportar** en el header)
- Importá un JSON anterior para restaurar o migrar datos entre dispositivos
- Si el botón muestra **⚠ Cambios pendientes**, es hora de hacer una copia

> Los datos son tuyos. PlantitasApp no envía nada a ningún servidor si no tienes una cuenta activa.

### Con cuenta — Planes de Pago

Al iniciar sesión con una cuenta, según tu plan podrás acceder a diferentes niveles de funcionalidad:

|                                            | Sin cuenta | Gratuito | Pro        | Premium     |
| ------------------------------------------ | ---------- | -------- | ---------- | ----------- |
| Todas las funciones de la app              | ✅         | ✅      | ✅         | ✅          |
| Datos locales (localStorage)               | ✅         | ✅      | ✅         | ✅          |
| Exportar / Importar JSON                   | ✅         | ✅      | ✅         | ✅          |
| Sincronización en la nube                  | ❌         | ❌      | ✅         | ✅          |
| Acceso multi-dispositivo                   | ❌         | ❌      | ✅         | ✅          |
| Papelera de registros eliminados           | ❌         | ❌      | ✅         | ✅          |
| Perfil editable (nombre, teléfono)         | ❌         | ✅      | ✅         | ✅          |
| Límite de registros (plantas, notas, etc.) | 15         | 30       | 300\*      | Ilimitado   |
| Tipo de pago                               | Gratis     | Gratis   | Pago único | Suscripción |

\*El plan Pro incluye 50 slots base + 250 slots adicionales que se adquieren por separado.

---

## Funcionalidades

Simplificando el cuidado de tus plantas. Un espacio organizado para acompañarte en cada riego, brote y cambio de estación.

### 🌱 Mis Plantas

Registrá cada planta con nombre, tipo, ícono, ubicación, luz y tipo de maceta. Cada planta tiene su **historial de logs**:

- Riego, fertilización, sustrato, trasplante, plagas/enfermedades y más
- La fecha del último riego se actualiza automáticamente
- Panel de detalle lateral en desktop, bottom sheet en mobile

### 🧪 Propagación

Seguimiento completo del ciclo de vida de tus esquejes y semillas:

- Vinculá cada propagación con su planta madre
- Métodos: agua, sustrato, musgo, etc.
- Estados: Activo → Trasplantada / Fracaso

### 📦 Inventario

Control de stock para lo que usás en tu jardín:

- Categorías: Sustratos, Fertilizantes, Polvos, Líquidos, Medicamentos, Otros
- Ajuste de cantidad con botones `+` / `−`
- Al registrar un log de mantenimiento, el inventario valida el stock disponible

### 📅 Planeación

Organizá tareas de cuidado por estación (Primavera, Verano, Otoño, Invierno):

- Tipos: Riego, Fertilización, Poda, Siembra, Limpieza, Tratamiento, etc.
- Ordenable por tipo o descripción

### 🌿 Lista de Deseos

Tu Lista de Deseos botánicos organizada por prioridad para que no se te escape ninguna:

- Prioridad Alta / Media / Baja con notas
- Seguimiento de plantas o artículos que querés conseguir

### 📝 Notas

Espacio libre para tus observaciones rápidas, ideas o recordatorios de tu jardín:

- Notas globales sin estructura
- Apuntes rápidos que no encajan en otras secciones

### 🏡 Jardín

El espacio donde tu esfuerzo florece y tu colección cobra vida:

- Vista general de tu colección completa
- Visualización de todas tus plantas en un solo lugar

### 💬 Foro

El espacio donde los Plant Lover pueden compartir experiencias, consejos y fotos de sus plantas:

- Comunidad de amantes de las plantas
- Compartir conocimientos y experiencias

### 🔍 Buscador Global

Buscador en tiempo real en el header que encuentra plantas, propagaciones e insumos de una sola vez.

---

## Perfil y cuenta

Desde `/profile` puedes:

- Editar tu nombre y teléfono
- Ver tu plan actual (Gratuito / Pro / Premium / Master Admin)
- Acceder a la **papelera** (solo planes Pro y superiores) — restaurá registros eliminados sin perder historial

---

## Stack Tecnológico

| Capa             | Tecnología                                              |
| ---------------- | ------------------------------------------------------- |
| Framework        | Next.js 15 (App Router)                                 |
| Lenguaje         | TypeScript                                              |
| Estilos          | CSS mobile-first + Tailwind v4                          |
| Estado cliente   | nanostores                                              |
| Auth             | Supabase Auth (email/password)                          |
| Base de datos    | Supabase (PostgreSQL + RLS)                             |
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

Aunque uses el plan gratuito, siempre puedes exportar todo tu jardín como JSON desde el botón **Exportar** en el header. El archivo incluye plantas, logs, propagaciones, inventario, wishlist, notas y tareas estacionales.

Para restaurar: usá el botón **Importar JSON** y elegí tu archivo. Puedes elegir entre reemplazar los datos actuales o fusionarlos con los existentes.

---

## Notas de los Planes

- **Sin cuenta**: Modo invitado ideal para probar la app. Los datos se pierden al borrar caché o cambiar de navegador.
- **Gratuito**: Para quienes quieren crear un perfil y guardar preferencias, pero manteniendo todo localmente.
- **Pro**: Pago único vitalicio que expande tu capacidad local sin suscripciones recurrentes. Incluye sincronización en la nube.
- **Premium**: Suscripción mensual/anual con sincronización en la nube ilimitada y acceso multi-dispositivo.
- **Master**: Nivel de sistema reservado para administradores y desarrollo interno.

---

Hecho con dedicación para Erzu, con ideas de Alex, y con vibecode mientras se jugaba Dota — porque YOLO.
