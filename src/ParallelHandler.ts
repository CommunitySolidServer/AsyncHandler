import { AsyncHandler } from './AsyncHandler';
import { handleIfAble } from './HandlerUtil';

/**
 * A composite handler that executes handlers in parallel.
 * Handlers that can not handler the input will be ignored.
 * The `canHandle` check of this handler will always succeed.
 */
export class ParallelHandler<TIn = void> extends AsyncHandler<TIn> {
  protected readonly handlers: AsyncHandler<TIn, unknown>[];

  public constructor(handlers: AsyncHandler<TIn, unknown>[]) {
    super();
    this.handlers = [ ...handlers ];
  }

  public async handle(input: TIn): Promise<void> {
    await Promise.all(
      this.handlers.map(async(handler): Promise<unknown> => handleIfAble(handler, input)),
    );
  }
}
