import { Plant } from "./Plant";

export interface PlantRepository {
  findAll(): Promise<Plant[]>;
  findById(id: number): Promise<Plant | null>;
  save(plant: Plant): Promise<void>;
  update(plant: Plant): Promise<void>;
  delete(id: number): Promise<void>;
}
