export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    // Captura el stack trace excluyendo el constructor de esta clase
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errores de Reglas de Negocio (ej: "La factura ya está pagada")
 * Status HTTP sugerido: 400 o 409
 */
export class DomainError extends AppError {
  constructor(message: string) {
    super(message, 'DOMAIN_RULE_VIOLATION', 400);
  }
}

/**
 * Errores de Validación de Entrada (ej: "Email inválido")
 * Status HTTP sugerido: 400
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

/**
 * Errores de Recurso No Encontrado (ej: "Usuario no existe")
 * Status HTTP sugerido: 404
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'RESOURCE_NOT_FOUND', 404);
  }
}

/**
 * Errores de Infraestructura (ej: "Stripe está caído", "DB timeout")
 * Status HTTP sugerido: 502 o 503
 */
export class InfrastructureError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'INFRASTRUCTURE_ERROR', 502);
    if (originalError) {
      // Log automático del error original para debugging interno
      console.error('[InfrastructureError Cause]:', originalError);
    }
  }
}