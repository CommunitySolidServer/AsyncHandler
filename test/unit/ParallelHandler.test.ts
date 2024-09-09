import type { AsyncHandler } from '../../src/AsyncHandler';
import { ParallelHandler } from '../../src/ParallelHandler';

describe('ParallelHandler', (): void => {
  let handlers: jest.Mocked<AsyncHandler<string, string>>[];
  let parallel: ParallelHandler<string>;

  beforeEach(async(): Promise<void> => {
    handlers = [
      {
        canHandle: jest.fn(),
        handle: jest.fn().mockResolvedValue('0'),
      } satisfies Partial<AsyncHandler<string, string>> as any,
      {
        canHandle: jest.fn(),
        handle: jest.fn().mockResolvedValue('1'),
      } satisfies Partial<AsyncHandler<string, string>> as any,
      {
        canHandle: jest.fn(),
        handle: jest.fn().mockResolvedValue('2'),
      } satisfies Partial<AsyncHandler<string, string>> as any,
    ];

    parallel = new ParallelHandler(handlers);
  });

  it('can handle all requests.', async(): Promise<void> => {
    handlers[0].canHandle.mockRejectedValueOnce(new Error('error'));
    handlers[1].handle.mockRejectedValueOnce(new Error('error'));
    await expect(parallel.canHandle('input')).resolves.toBeUndefined();
  });

  it('runs all handlers that can handle the input.', async(): Promise<void> => {
    handlers[0].canHandle.mockRejectedValueOnce(new Error('error'));
    await expect(parallel.handle('abc')).resolves.toBeUndefined();

    expect(handlers[0].canHandle).toHaveBeenLastCalledWith('abc');
    expect(handlers[1].canHandle).toHaveBeenLastCalledWith('abc');
    expect(handlers[2].canHandle).toHaveBeenLastCalledWith('abc');

    expect(handlers[0].handle).toHaveBeenCalledTimes(0);
    expect(handlers[1].handle).toHaveBeenLastCalledWith('abc');
    expect(handlers[2].handle).toHaveBeenLastCalledWith('abc');
  });
});
