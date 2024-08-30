import cluster from 'node:cluster';
import { AsyncHandler } from './AsyncHandler';

/**
 * A wrapper handler that will only run the wrapped handler if it is executed from:
 * * when running multithreaded: either the **primary** or a **worker process**
 * * when running singlethreaded: **the only process** (i.e. always)
 */
export class ProcessHandler<TIn, TOut> extends AsyncHandler<TIn, TOut> {
  protected readonly source: AsyncHandler<TIn, TOut>;
  protected readonly executeOnPrimary: boolean;
  protected isSingleThreaded: boolean;

  /**
   * Creates a new ProcessHandler
   *
   * @param source - The wrapped handler
   * @param executeOnPrimary - Whether to execute the source handler when the process is the _primary_ or a _worker_.
   */
  public constructor(source: AsyncHandler<TIn, TOut>, executeOnPrimary: boolean) {
    super();
    this.source = source;
    this.executeOnPrimary = executeOnPrimary;
    this.isSingleThreaded = true;
    cluster.on('fork', (): unknown => this.isSingleThreaded = false);
  }

  public async canHandle(input: TIn): Promise<void> {
    if (!this.canExecute()) {
      throw new Error(`Will not execute on ${this.executeOnPrimary ? 'worker' : 'primary'} process.`);
    }
    await this.source.canHandle(input);
  }

  public async handle(input: TIn): Promise<TOut> {
    return this.source.handle(input);
  }

  /**
   * Checks if the condition has already been fulfilled.
   */
  protected canExecute(): boolean {
    return this.isSingleThreaded || (this.executeOnPrimary === cluster.isPrimary);
  }
}
