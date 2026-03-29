import { DomainError } from '@shared/infrastructure/errors/DomainError';

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
