import cluster from 'node:cluster';
import type { AsyncHandler } from '../../src/AsyncHandler';
import { ProcessHandler } from '../../src/ProcessHandler';

describe('ProcessHandler', (): void => {
  const primary = cluster.isPrimary;
  let source: jest.Mocked<AsyncHandler<string, string>>;
  let ph: ProcessHandler<string, string>;

  beforeEach(async(): Promise<void> => {
    source = {
      canHandle: jest.fn(),
      handleSafe: jest.fn().mockResolvedValue('handledSafely'),
      handle: jest.fn().mockResolvedValue('handled'),
    };
  });

  afterAll(async(): Promise<void> => {
    (cluster as any).isPrimary = primary;
  });

  describe('allowing only worker processes', (): void => {
    beforeEach(async(): Promise<void> => {
      ph = new ProcessHandler(source, false);
    });

    it('can delegate to its source when run singlethreaded from worker.', async(): Promise<void> => {
      (cluster as any).isPrimary = false;
      const ph = new ProcessHandler(source, false);
      await expect(ph.handleSafe('test')).resolves.toBe('handled');
    });

    it('can delegate to its source when run singlethreaded from primary.', async(): Promise<void> => {
      (cluster as any).isPrimary = true;
      await expect(ph.handleSafe('test')).resolves.toBe('handled');
    });

    it('can delegate to its source when run multithreaded from worker.', async(): Promise<void> => {
      (cluster as any).isPrimary = false;
      cluster.emit('fork');
      await expect(ph.handleSafe('test')).resolves.toBe('handled');
    });

    it('errors when run multithreaded from primary.', async(): Promise<void> => {
      (cluster as any).isPrimary = true;
      cluster.emit('fork');
      await expect(ph.handleSafe('test')).rejects.toThrow(`Will not execute on primary process.`);
    });
  });

  describe('allowing only the primary process', (): void => {
    beforeEach(async(): Promise<void> => {
      ph = new ProcessHandler(source, true);
    });

    it('can delegate to its source when run singlethreaded from worker.', async(): Promise<void> => {
      (cluster as any).isPrimary = false;
      await expect(ph.handleSafe('test')).resolves.toBe('handled');
    });

    it('can delegate to its source when run singlethreaded from primary.', async(): Promise<void> => {
      (cluster as any).isPrimary = true;
      await expect(ph.handleSafe('test')).resolves.toBe('handled');
    });

    it('can delegate to its source when run multithreaded from primary.', async(): Promise<void> => {
      (cluster as any).isPrimary = true;
      cluster.emit('fork');
      await expect(ph.handleSafe('test')).resolves.toBe('handled');
    });

    it('errors when run multithreaded from worker.', async(): Promise<void> => {
      (cluster as any).isPrimary = false;
      cluster.emit('fork');
      await expect(ph.handleSafe('test')).rejects.toThrow(`Will not execute on worker process.`);
    });
  });
});
