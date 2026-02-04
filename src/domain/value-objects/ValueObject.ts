export abstract class ValueObject {
  protected abstract obterComponentesDeIgualdade(): Record<string, any>;

  public equals(other: ValueObject): boolean {
    if (!other || !(other instanceof ValueObject)) {
      return false;
    }
    return (
      JSON.stringify(this.obterComponentesDeIgualdade()) ===
      JSON.stringify(other.obterComponentesDeIgualdade())
    );
  }
}
