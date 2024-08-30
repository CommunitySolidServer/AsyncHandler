/**
 * Returns the error thrown by the given function.
 * Throws an error if the function does not throw.
 */
export async function getError(fn: () => any): Promise<Error> {
  try {
    await fn();
  } catch (err: unknown) {
    return err as Error;
  }
  throw new Error('Function did not throw');
}
