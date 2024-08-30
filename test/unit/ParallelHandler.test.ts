import type { AsyncHandler } from '../../src/AsyncHandler';
import { ParallelHandler } from '../../src/ParallelHandler';

describe('ParallelHandler', (): void => {
  let handlers: jest.Mocked<AsyncHandler<string, string>>[];
  let parallel: ParallelHandler<string>;

  beforeEach(async(): Promise<void> => {
    handlers = [
      {
        handleSafe: jest.fn().mockResolvedValue('0'),
      } satisfies Partial<AsyncHandler<string, string>> as any,
      {
        handleSafe: jest.fn().mockResolvedValue('1'),
      } satisfies Partial<AsyncHandler<string, string>> as any,
      {
        handleSafe: jest.fn().mockResolvedValue('2'),
      } satisfies Partial<AsyncHandler<string, string>> as any,
    ];

    parallel = new ParallelHandler(handlers);
  });

  it('can handle all requests.', async(): Promise<void> => {
    handlers[0].handleSafe.mockRejectedValueOnce(new Error('error'));
    await expect(parallel.canHandle('input')).resolves.toBeUndefined();
  });

  it('runs all handlers that can handle the input.', async(): Promise<void> => {
    await expect(parallel.handle('abc')).resolves.toBeUndefined();

    expect(handlers[0].handleSafe).toHaveBeenCalledTimes(1);
    expect(handlers[1].handleSafe).toHaveBeenCalledTimes(1);
    expect(handlers[2].handleSafe).toHaveBeenCalledTimes(1);

    expect(handlers[0].handleSafe).toHaveBeenCalledWith('abc');
    expect(handlers[1].handleSafe).toHaveBeenCalledWith('abc');
    expect(handlers[2].handleSafe).toHaveBeenCalledWith('abc');
  });
});
