import { getLoggerFor } from 'global-logger-factory';
import { AsyncHandler } from './AsyncHandler';
import { filterHandlers } from './HandlerUtil';

/**
 * A composite handler that returns true if any of its handlers can handle the input and return true.
 * Handler errors are interpreted as false results.
 */
export class BooleanHandler<TIn> extends AsyncHandler<TIn, boolean> {
  protected readonly logger = getLoggerFor(this);

  protected readonly handlers: AsyncHandler<TIn, boolean>[];

  /**
   * Creates a new BooleanHandler that stores the given handlers.
   *
   * @param handlers - Handlers over which it will run.
   */
  public constructor(handlers: AsyncHandler<TIn, boolean>[]) {
    super();
    this.handlers = handlers;
  }

  public async canHandle(input: TIn): Promise<void> {
    // We use this to generate an error if no handler supports the input
    await filterHandlers(this.handlers, input);
  }

  public async handleSafe(input: TIn): Promise<boolean> {
    const handlers = await filterHandlers(this.handlers, input);
    return promiseSome(handlers.map(async(handler): Promise<boolean> => handler.handle(input)));
  }

  public async handle(input: TIn): Promise<boolean> {
    let handlers: AsyncHandler<TIn, boolean>[];
    try {
      handlers = await filterHandlers(this.handlers, input);
    } catch (error: unknown) {
      this.logger.warn('All handlers failed. This might be the consequence of calling handle before canHandle.');
      throw new Error('All handlers failed', { cause: error });
    }
    return promiseSome(handlers.map(async(handler): Promise<boolean> => handler.handle(input)));
  }
}

function noop(): void {}

/**
 * A function that simulates the Array.some behaviour but on an array of Promises.
 * Returns true if at least one promise returns true.
 * Returns false if all promises return false or error.
 *
 * @remarks
 *
 * Predicates provided as input must be implemented considering
 * the following points:
 * 1. if they throw an error, it won't be propagated;
 * 2. throwing an error should be logically equivalent to returning false.
 */
export async function promiseSome(predicates: Promise<boolean>[]): Promise<boolean> {
  return new Promise((resolve): void => {
    function resolveIfTrue(value: boolean): void {
      if (value) {
        resolve(true);
      }
    }
    Promise.all(predicates.map(async(predicate): Promise<void> => predicate.then(resolveIfTrue, noop)))
      .then((): void => resolve(false), noop);
  });
}
