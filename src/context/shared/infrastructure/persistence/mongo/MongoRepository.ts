import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { MongoInfrastructureError } from '@shared/infrastructure/persistence/mongo/MongoInfrastructureError';

export abstract class MongoRepository {
  protected translateError(error: unknown): MongoInfrastructureError {
    if (error instanceof MongoInfrastructureError) {
      return error;
    }
    const mongoError = error as Record<string, any>;

    const message = mongoError.message || 'An unexpected database error occurred';
    // 1. Validar por código numérico de MongoDB
    if (mongoError.code) {
      switch (mongoError.code) {
        case 11000:
          return new MongoInfrastructureError(
            'Duplicate key violation: A record with this unique identifier already exists.',
            ErrorCode.DB_DUPLICATE_KEY,
            mongoError.keyValue // Incluye qué campo falló (ej: { name: "My Instance" })
          );

        case 50: // ExceededTimeLimit (Timeout de ejecución)
        case 202: // NetworkTimeout
          return new MongoInfrastructureError(
            'Database operation timed out. Please try again.',
            ErrorCode.DB_CONNECTION_FAILED,
            { mongoCode: mongoError.code }
          );
      }
    }
    // 2. Validar por el nombre del error (Mongoose)
    if (mongoError.name) {
      switch (mongoError.name) {
        case 'ValidationError': // Errores de esquema de Mongoose
          return new MongoInfrastructureError(
            `Database schema validation failed: ${message}`,
            ErrorCode.VALIDATION_FAILED,
            mongoError.errors
          );

        case 'CastError': // ID con formato incorrecto enviado a Mongo
          return new MongoInfrastructureError(
            `Invalid database ID format format for field "${mongoError.path}": <${mongoError.value}>`,
            ErrorCode.INVALID_DATA_TYPE,
            { path: mongoError.path, value: mongoError.value }
          );

        case 'MongooseServerSelectionError': // Base de datos caída
          return new MongoInfrastructureError(
            'Could not connect to the database server. Server down or unreachable.',
            ErrorCode.DB_CONNECTION_FAILED,
            { originalError: mongoError.name }
          );
      }
    }

    // 3. Fallback genérico para cualquier otro error de persistencia (Rango 3000)
    return new MongoInfrastructureError(message, ErrorCode.DATABASE_ERROR, { raw: error });
  }
}
