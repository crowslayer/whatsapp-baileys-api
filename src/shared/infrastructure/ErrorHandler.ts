export class DomainError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'DomainError';
    }
  }
  
  export class ValidationError extends DomainError {
    constructor(message: string, public readonly fields?: Record<string, string[]>) {
      super(message);
      this.name = 'ValidationError';
    }
  }
  
  export class NotFoundError extends DomainError {
    constructor(message: string) {
      super(message);
      this.name = 'NotFoundError';
    }
  }
  
  export class ConflictError extends DomainError {
    constructor(message: string) {
      super(message);
      this.name = 'ConflictError';
    }
  }
  
  export class UnauthorizedError extends DomainError {
    constructor(message: string) {
      super(message);
      this.name = 'UnauthorizedError';
    }
  }
  
  export class InfrastructureError extends Error {
    constructor(message: string, public readonly originalError?: Error) {
      super(message);
      this.name = 'InfrastructureError';
    }
  }
  
  export class WhatsAppConnectionError extends InfrastructureError {
    constructor(message: string, originalError?: Error) {
      super(message, originalError);
      this.name = 'WhatsAppConnectionError';
    }
  }