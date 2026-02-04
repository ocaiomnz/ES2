import { v4 as uuidv4 } from "uuid";

export abstract class Entity {
  protected readonly _id: string;

  protected constructor(id?: string) {
    this._id = id || uuidv4();
  }

  public get id(): string {
    return this._id;
  }

  public equals(other: Entity): boolean {
    if (!other || !(other instanceof Entity)) {
      return false;
    }
    return this._id === other._id;
  }
}
