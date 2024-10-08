import type { AsyncHandler } from './AsyncHandler';

/**
 * Finds a handler that can handle the given input data.
 * Otherwise, an error gets thrown.
 *
 * @param handlers - List of handlers to search in.
 * @param input - The input data.
 *
 * @returns A promise resolving to a handler that supports the data or otherwise rejecting.
 */
export async function findHandler<TIn, TOut>(handlers: AsyncHandler<TIn, TOut>[], input: TIn):
Promise<AsyncHandler<TIn, TOut>> {
  const errors: Error[] = [];

  for (const handler of handlers) {
    try {
      await handler.canHandle(input);

      return handler;
    } catch (error: unknown) {
      errors.push(error as Error);
    }
  }

  throw new AggregateError(errors, 'No handler can handle the input');
}

/**
 * Filters a list of handlers to only keep those that can handle the input.
 * Will error if no matching handlers are found.
 *
 * @param handlers - Handlers to filter.
 * @param input - Input that needs to be supported.
 */
export async function filterHandlers<TIn, TOut>(handlers: AsyncHandler<TIn, TOut>[], input: TIn):
Promise<AsyncHandler<TIn, TOut>[]> {
  const results = await Promise.allSettled(handlers.map(async(handler): Promise<AsyncHandler<TIn, TOut>> => {
    await handler.canHandle(input);
    return handler;
  }));
  const matches = results.filter(({ status }): boolean => status === 'fulfilled')
    .map((result): AsyncHandler<TIn, TOut> =>
      (result as PromiseFulfilledResult<AsyncHandler<TIn, TOut>>).value);

  if (matches.length > 0) {
    return matches;
  }

  // Generate error in case no matches were found
  const errors = results.map((result): Error => (result as PromiseRejectedResult).reason as Error);

  throw new AggregateError(errors, 'No handler can handle the input');
}

/**
 * Returns the value of the `handle` call if the handle can handle input.
 *
 * @param handler - Handler to run the input.
 * @param input - Input to handle.
 */
export async function handleIfAble<TIn, TOut>(handler: AsyncHandler<TIn, TOut>, input: TIn): Promise<TOut | void> {
  try {
    await handler.canHandle(input);
  } catch {
    return;
  }
  return handler.handle(input);
}
