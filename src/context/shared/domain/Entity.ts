export abstract class Entity<T> {
  protected readonly _id: T;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(id: T, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  get id(): T {
    return this._id;
  }

  public equals(entity?: Entity<T>): boolean {
    if (!entity) return false;
    if (!(entity instanceof Entity)) return false;
    return this._id === entity._id;
  }
}
