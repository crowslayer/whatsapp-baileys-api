export enum ErrorCode {
  // ==========================================
  // 1000 - IDENTIDAD, SESIÓN Y ACCESO (Agnóstico a HTTP)
  // ==========================================
  UNAUTHENTICATED = 1001, // No se sabe quién es (Falta token/sesión)
  UNAUTHORIZED = 1002, // Se sabe quién es, pero no tiene el rol/permiso
  INVALID_CREDENTIALS = 1003, // Usuario o contraseña incorrectos
  TOKEN_EXPIRED = 1004, // El token ya no es válido por tiempo
  TOKEN_MALFORMED = 1005, // Estructura de token corrupta
  ACCOUNT_DISABLED = 1006, // El usuario existe pero está baneado/suspendido
  SESSION_ALREADY_EXISTS = 1007, // Intento de doble login si se restringe la sesión

  // ==========================================
  // 2000 - VALIDACIÓN DE INPUTS Y DATOS (Sintaxis)
  // ==========================================
  VALIDATION_FAILED = 2001, // Formato incorrecto (ej: regex de email falló)
  MISSING_REQUIRED_FIELDS = 2002, // Faltan campos obligatorios en el payload
  INVALID_DATA_TYPE = 2003, // Se esperaba un número y se envió un string
  PAYLOAD_TOO_LARGE = 2004, // Archivo o JSON excede el tamaño máximo permitido

  // ==========================================
  // 3000 - PERSISTENCIA Y ALMACENAMIENTO (Base de Datos)
  // ==========================================
  DATABASE_ERROR = 3000, // Fallo genérico de base de datos
  DB_CONNECTION_FAILED = 3001, // Base de datos caída o timeout de conexión
  DB_DUPLICATE_KEY = 3002, // Violación de restricción única (Unique Constraint)
  DB_FOREIGN_KEY_VIOLATION = 3003, // Intento de asociar a un ID que no existe en otra tabla
  DB_TRANSACTION_FAILED = 3004, // El ACID rollback falló
  DB_CONCURRENCY_CONFLICT = 3005, // Conflicto de escritura (Locking optimista/pesimista)

  // ==========================================
  // 4000 - CONTROL DE FLUJO E INFRAESTRUCTURA EXTERNA
  // ==========================================
  TOO_MANY_REQUESTS = 4001, // Rate limit excedido
  THIRD_PARTY_PROVIDER_DOWN = 4002, // Stripe, Twilio o AWS S3 no responden
  THIRD_PARTY_API_ERROR = 4003, // El proveedor respondió, pero devolvió un error interno

  // ==========================================
  // 5000 - ERRORES INTERNOS DEL SISTEMA (Inesperados)
  // ==========================================
  INTERNAL_ERROR = 5000, // Excepción `try/catch` no controlada en el código
  NOT_IMPLEMENTED = 5001, // Funcionalidad en desarrollo (Placeholder)
  SERVICE_UNAVAILABLE = 5002, // El servidor está saturado de memoria/CPU

  // ==========================================
  // 6000 - REGLAS DE NEGOCIO (El Núcleo del Hexágono)
  // ==========================================
  RESOURCE_NOT_FOUND = 6001, // El agregado/entidad buscado no existe (ej: UserNotFound)
  BUSINESS_RULE_VIOLATION = 6002, // Caso genérico de regla de negocio rota
  INSUFFICIENT_FUNDS = 6003, // Ejemplo clásico de negocio (Banca/Ecommerce)
  LIMIT_EXCEEDED = 6004, // Intentó superar un límite de negocio (ej: max 5 elementos)
  INVALID_STATE_TRANSITION = 6005, // Intentar pasar una orden de "Cancelada" a "Entregada"
  BATCH_PROCESSING_PARTIAL = 6006, // En operaciones masivas, algunas filas fallaron

  // ==========================================
  // 7000 - EVENTOS Y ARQUITECTURA REACTIVA (CQRS / Buses)
  // ==========================================
  EVENT_ERROR = 7000,
  EVENT_HANDLER_NOT_FOUND = 7001,
  EVENT_PUBLISH_FAILED = 7002,
  EVENT_SUBSCRIPTION_FAILED = 7003,
  EVENT_SERIALIZATION_FAILED = 7004,
  EVENT_DESERIALIZATION_FAILED = 7005,
  EVENT_PROCESSING_TIMEOUT = 7006,

  // --- Extensiones para CQRS ---
  COMMAND_HANDLER_NOT_FOUND = 7007, // Intentar ejecutar un Comando que no tiene Handler registrado
  QUERY_HANDLER_NOT_FOUND = 7008, // Intentar ejecutar una Query que no tiene Handler registrado
  COMMAND_VALIDATION_FAILED = 7009, // El input del Comando no pasa las reglas (Middleware)
  QUERY_VALIDATION_FAILED = 7010, // El input de la Query viene mal estructurado (Middleware)
  BUS_DISPATCH_FAILED = 7011, // Error crítico al despachar el mensaje dentro del bus
  BUS_MIDDLEWARE_ERROR = 7012, // Un middleware del bus falló antes del handler
}
