export abstract class DomainError extends Error {
  protected constructor(message?: string) {
    super(message);
    // Solución para instanceof en TypeScript < ES6
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
