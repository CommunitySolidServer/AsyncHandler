import type { AsyncHandler } from '../../src/AsyncHandler';
import { WaterfallHandler } from '../../src/WaterfallHandler';
import { getError } from '../TestUtil';

describe('WaterfallHandler', (): void => {
  describe('with no handlers', (): void => {
    it('can never handle data.', async(): Promise<void> => {
      const handler = new WaterfallHandler([]);

      await expect(handler.canHandle()).rejects.toThrow(Error);
    });

    it('errors if its handle function is called.', async(): Promise<void> => {
      const handler = new WaterfallHandler([]);

      await expect(handler.handle()).rejects.toThrow(Error);
    });
  });

  describe('with multiple handlers', (): void => {
    let handlerTrue: jest.Mocked<AsyncHandler<any, any>>;
    let handlerFalse: jest.Mocked<AsyncHandler<any, any>>;

    beforeEach(async(): Promise<void> => {
      handlerTrue = {
        canHandle: jest.fn(),
        handle: jest.fn().mockImplementation((input: any): any => input),
      } satisfies Partial<AsyncHandler> as any;
      handlerFalse = {
        canHandle: jest.fn().mockRejectedValue(new Error('Not supported')),
      } satisfies Partial<AsyncHandler> as any;
    });

    it('can handle data if a handler supports it.', async(): Promise<void> => {
      const handler = new WaterfallHandler([ handlerFalse, handlerTrue ]);

      await expect(handler.canHandle(null)).resolves.toBeUndefined();
    });

    it('can not handle data if no handler supports it.', async(): Promise<void> => {
      const handler = new WaterfallHandler([ handlerFalse, handlerFalse ]);

      const err = await getError(async(): Promise<void> => handler.canHandle(null));
      const error = err as AggregateError;
      expect(error.message).toBe('No handler can handle the input');
      expect(error.errors).toHaveLength(2);
      expect(error.errors[0].message).toBe('Not supported');
      expect(error.errors[1].message).toBe('Not supported');
    });

    it('handles data if a handler supports it.', async(): Promise<void> => {
      const handler = new WaterfallHandler([ handlerFalse, handlerTrue ]);

      await expect(handler.handle('test')).resolves.toBe('test');
      expect(handlerTrue.canHandle).toHaveBeenCalledTimes(1);
      expect(handlerTrue.canHandle).toHaveBeenLastCalledWith('test');
      expect(handlerTrue.handle).toHaveBeenCalledTimes(1);
      expect(handlerTrue.handle).toHaveBeenLastCalledWith('test');
    });

    it('errors if the handle function is called but no handler supports the data.', async(): Promise<void> => {
      const handler = new WaterfallHandler([ handlerFalse, handlerFalse ]);

      await expect(handler.handle('test')).rejects.toThrow('All handlers failed');
    });

    it('only calls the canHandle function once of its handlers when handleSafe is called.', async(): Promise<void> => {
      const handler = new WaterfallHandler([ handlerFalse, handlerTrue ]);

      await expect(handler.handleSafe('test')).resolves.toBe('test');
      expect(handlerTrue.canHandle).toHaveBeenCalledTimes(1);
      expect(handlerTrue.canHandle).toHaveBeenLastCalledWith('test');
      expect(handlerTrue.handle).toHaveBeenCalledTimes(1);
      expect(handlerTrue.handle).toHaveBeenLastCalledWith('test');
    });

    it('throws the canHandle error when calling handleSafe if the data is not supported.', async(): Promise<void> => {
      const handler = new WaterfallHandler([ handlerFalse, handlerFalse ]);

      const err = await getError(async(): Promise<void> => handler.handleSafe(null));
      const error = err as AggregateError;
      expect(error.message).toBe('No handler can handle the input');
      expect(error.errors).toHaveLength(2);
      expect(error.errors[0].message).toBe('Not supported');
      expect(error.errors[1].message).toBe('Not supported');
    });
  });
});
