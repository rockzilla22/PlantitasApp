// Utilidad para valores que pueden ser nulos (más explícito que usar ? o null directo)
export type Nullable<T> = T | null;

// Contrato estándar para cualquier Caso de Uso (Application Service)
// Asegura que todos tus servicios tengan un método 'execute' consistente.
export interface UseCase<Input = void, Output = void> {
  execute(input: Input): Promise<Output> | Output;
}

// Tipo útil para DTOs parciales (ej: Patch de actualización)
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Tipo para representar identificadores únicos (si decides cambiar string por UUID brandeado a futuro)
export type UniqueId = string;