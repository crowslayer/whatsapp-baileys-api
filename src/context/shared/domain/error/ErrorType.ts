export enum ErrorType {
  // --- CAPA DE NEGOCIO Y DOMINIO (El Hexágono) ---
  DOMAIN_VIOLATION = 'domain_business_violation', // Reglas de negocio rotas (ej: Sin saldo)
  VALIDATION = 'validation_error', // Datos con formato inválido o corruptos
  NOT_FOUND = 'resource_not_found', // Algo que debía existir no se encontró

  // --- CAPA DE SEGURIDAD / CONTROL DE ACCESO ---
  UNAUTHENTICATED = 'unauthenticated', // No se sabe quién es el usuario
  UNAUTHORIZED = 'unauthorized_permission', // Se sabe quién es, pero no tiene permisos

  // --- CAPA DE INFRAESTRUCTURA ---
  DATABASE = 'database_failure', // Errores de BD (Query inválida, timeout)
  INFRASTRUCTURE = 'infrastructure_failure', // APIs de terceros caídas (Stripe, Email)
  EVENT = 'event_bus_failure', // Error al procesar/publicar eventos

  // --- ERRORES DEL SISTEMA / HTTP ENTRYPOINTS ---
  RATE_LIMIT = 'rate_limit_exceeded', // Abuso de llamadas a la API
  INTERNAL = 'internal_server_error', // Excepciones de código no controladas
}
