import { AsyncHandler } from './AsyncHandler';
import type { ErrorFactory } from './ErrorFactory';

/**
 * Utility handler that always throws an error.
 * If `onlyHandle` is set to `true` (default), this handler will accept all input,
 * if set to `false`, it will also throw on any `canHandle` call.
 *
 * If no {@link ErrorFactory} is provided, a standard error will be thrown.
 */
export class StaticThrowHandler extends AsyncHandler<unknown, never> {
  protected readonly onlyHandle: boolean;
  protected readonly message?: string;
  protected readonly factory?: ErrorFactory;

  public constructor(onlyHandle = true, message?: string, factory?: ErrorFactory) {
    super();
    this.onlyHandle = onlyHandle;
    this.message = message;
    this.factory = factory;
  }

  public async canHandle(): Promise<void> {
    if (!this.onlyHandle) {
      return this.handle();
    }
  }

  public async handle(): Promise<never> {
    if (this.factory) {
      throw this.factory.create(this.message);
    }
    throw new Error(this.message);
  }
}
