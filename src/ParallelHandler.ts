import { AsyncHandler } from './AsyncHandler';

/**
 * A composite handler that executes handlers in parallel.
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
      this.handlers.map(async(handler): Promise<unknown> => handler.handleSafe(input)),
    );
  }
}
