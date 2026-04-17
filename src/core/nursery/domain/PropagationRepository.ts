import { Propagation } from "./Propagation";

export interface PropagationRepository {
  findAll(): Promise<Propagation[]>;
  findById(id: number): Promise<Propagation | null>;
  save(propagation: Propagation): Promise<void>;
  update(propagation: Propagation): Promise<void>;
  delete(id: number): Promise<void>;
}
