import { InventoryItem, InventoryCategory } from "./InventoryItem";

export interface InventoryRepository {
  findAll(): Promise<InventoryItem[]>;
  findByCategory(category: InventoryCategory): Promise<InventoryItem[]>;
  save(item: InventoryItem): Promise<void>;
  update(item: InventoryItem): Promise<void>;
  delete(id: string): Promise<void>;
}
