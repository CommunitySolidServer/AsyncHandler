/**
 * Used to generate {@link Error} objects.
 */
export interface ErrorFactory<T extends Error = Error> {
  /**
   * Generate an error with the given message.
   *
   * @param message - Message for the resulting error.
   */
  create: (message?: string) => T;
}
