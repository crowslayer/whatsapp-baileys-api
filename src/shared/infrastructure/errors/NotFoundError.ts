import { DomainError } from '@shared/infrastructure/errors/DomainError';

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
