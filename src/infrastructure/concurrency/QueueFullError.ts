export class QueueFullError extends Error {
  constructor(message = 'Request queue is full') {
    super(message);
    this.name = 'QueueFullError';

    Object.setPrototypeOf(this, QueueFullError.prototype);
  }
}
