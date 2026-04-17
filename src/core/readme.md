# 🚀 Boilerplate: Next.js + DDD (Clean Architecture)

Este repositorio es una base sólida para proyectos que requieren una separación clara entre la lógica de negocio y la tecnología, utilizando Next.js (App Router) para el manejo de rutas y Zod para la integridad de los datos.

# Instalar Zod (si empiezas de cero)

pnpm add zod

# Estructura del Proyecto

La lógica central reside en `/core/`, manteniéndose independiente de los frameworks.

## 🏗️ Capas del Core (/core/)

Domain 🧠: Contiene las reglas esenciales.

core/creature/domain/Creature.ts: Entidad con validaciones de negocio.

core/creature/domain/CreatureRepository.ts: Contrato (interfaz) para persistencia.

core/creature/domain/CreatureSchema.ts: Esquema de Zod para contratos de datos.

Application 🎬: Orquestadores de casos de uso.

core/creature/application/UploadCreature.ts: Proceso para validar y guardar.

## Infrastructure 🛠️: Implementaciones técnicas.

core/creature/infrastructure/MongoRepository.ts: Conexión real con la base de datos.

### 1. Domain 🧠: Reglas Esenciales

Es el corazón del sistema. Define qué es el objeto y sus reglas innegociables.

**`core/creature/domain/CreatureSchema.ts`**

```
import { z } from 'zod';

export const CreatureSchema = z.object({
  name: z.string().min(3, "El nombre es muy corto"),
  level: z.number().int().positive().max(20),
  biome: z.string()
});

export type CreatureInput = z.infer<typeof CreatureSchema>;

```

**`core/creature/domain/Creature.ts`**

```
import { CreatureInput } from "./CreatureSchema";

export class Creature {
  constructor(public readonly props: CreatureInput) {
    // Validaciones de negocio adicionales si fueran necesarias
    if (props.name === "Admin") throw new Error("Nombre no permitido");
  }
}

```

**`core/creature/domain/CreatureRepository.ts`**

```
import { Creature } from "./Creature";

export interface CreatureRepository {
  save(creature: Creature): Promise<void>;
  findAll(): Promise<Creature[]>;
}

```

### 2. Application 🎬: Orquestadores

Coordina el flujo de datos entre la API y el dominio.

**`core/creature/application/UploadCreature.ts`**

```
import { Creature } from "../domain/Creature";
import { CreatureRepository } from "../domain/CreatureRepository";
import { CreatureInput } from "../domain/CreatureSchema";

export class UploadCreature {
  constructor(private repository: CreatureRepository) {}

  async execute(input: CreatureInput): Promise<void> {
    const creature = new Creature(input);
    await this.repository.save(creature);
  }
}

```

### 3. Infrastructure 🛠️: Implementación Técnica

Detalles de bajo nivel (bases de datos, frameworks).

**`core/creature/infrastructure/MongoRepository.ts`**

```
import { CreatureRepository } from "../domain/CreatureRepository";
import { Creature } from "../domain/Creature";

export class MongoRepository implements CreatureRepository {
  async save(creature: Creature): Promise<void> {
    // Lógica real de MongoDB usando fetch o un driver (mongoose/mongodb)
    console.log("Guardando en Mongo:", creature.props);
  }

  async findAll(): Promise<Creature[]> {
    return []; // Implementación de lectura
  }
}

```

---

## 🛣️ Rutas de la API (Next.js App Router)

En Next.js, las APIs se definen en la carpeta `app/`.

### `src/app/api/creature/route.ts`

```
import { NextResponse } from 'next/server';
import { CreatureSchema } from '@/core/creature/domain/CreatureSchema';
import { UploadCreature } from '@/core/creature/application/UploadCreature';
import { MongoRepository } from '@/core/creature/infrastructure/MongoRepository';

const repo = new MongoRepository();
const uploadUseCase = new UploadCreature(repo);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = CreatureSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(result.error.format(), { status: 400 });
    }

    await uploadUseCase.execute(result.data);
    return NextResponse.json({ message: "Creado" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

```

1. errors.ts: El Diccionario de Fallos ⚠️
Este archivo centraliza cómo tu aplicación comunica que algo salió mal. En lugar de usar errores genéricos, defines clases personalizadas (como DomainError o NotFoundError). Esto permite que tu API responda con el código HTTP exacto (400, 404, 502, etc.) según el tipo de error capturado.

2. types.ts: El Lenguaje Común 🏗️
Define las estructuras de datos que se repiten en todo el sistema. Incluye utilidades para manejar valores nulos (Nullable) o contratos estándar para los casos de uso (como la interfaz UseCase). Esto asegura que todos tus archivos hablen el mismo idioma técnico.

3. container.ts: El Pegamento (Inyección de Dependencias) 💉
Es el lugar donde se instancian y "ensamblan" las piezas de tu sistema. Su trabajo es crear el repositorio (infraestructura) e inyectarlo en el caso de uso (aplicación). Gracias a esto, tu API solo tiene que importar el caso de uso listo para funcionar, sin saber qué base de datos hay detrás.

---

## 🛡️ Seguridad

1. **Zod Parsing 🧼**: Se usa `safeParse` en la entrada de la API para evitar inyecciones de datos basura.
2. **BtnSubir (Frontend) 🖱️**: Controlar el estado de carga para evitar el "doble clic" y spam.
3. **Variables de Entorno 🔐**: Uso de `.env.local` para proteger el URI de la base de datos.
