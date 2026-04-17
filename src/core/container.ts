import "server-only";

// 1. Importamos la infraestructura y el caso de uso
//casos de uso
import { MongoRepository } from "@/core/creature/infrastructure/MongoRepository";
import { UploadCreature } from "@/core/creature/application/UploadCreature";
// import { UpdateCreature } from "@/core/creature/application/UpdateCreature";

// Instanciamos la infraestructura
const creatureRepository = new MongoRepository();

// 2. Inyectamos esa instancia en el caso de uso y exportamos
export const uploadCreatureUseCase = new UploadCreature(creatureRepository);
// export const updateCreatureUseCase = new UpdateCreature(creatureRepository);
