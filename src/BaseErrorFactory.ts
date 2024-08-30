import type { ErrorFactory } from './ErrorFactory';

/**
 * An {@link ErrorFactory} that generates a basic {@link Error} with the given message.
 *
 * If no message is provided when calling the `create` function,
 * the message that was provided in the constructor will be used.
 */
export class BaseErrorFactory implements ErrorFactory {
  protected readonly message?: string;

  public constructor(message?: string) {
    this.message = message;
  }

  public create(message?: string): Error {
    return new Error(message ?? this.message);
  }
}
