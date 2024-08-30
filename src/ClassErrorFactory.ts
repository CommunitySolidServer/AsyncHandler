import type { ErrorFactory } from './ErrorFactory';

/**
 * An {@link ErrorFactory} that returns an error using the empty constructor of the input error object.
 */
export class ClassErrorFactory<T extends Error> implements ErrorFactory {
  protected readonly error: T;

  public constructor(error: T) {
    this.error = error;
  }

  public create(): T {
    return new (this.error.constructor as new() => T)();
  }
}
