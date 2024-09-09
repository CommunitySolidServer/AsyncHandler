import type { AsyncHandler } from '../../src/AsyncHandler';
import { filterHandlers, findHandler, handleIfAble } from '../../src/HandlerUtil';
import { getError } from '../TestUtil';

describe('HandlerUtil', (): void => {
  let handlerTrue: AsyncHandler<any, any>;
  let handlerFalse: AsyncHandler<any, any>;

  beforeEach(async(): Promise<void> => {
    handlerTrue = {
      canHandle: jest.fn(),
      handle: jest.fn().mockResolvedValue(true),
    } satisfies Partial<AsyncHandler<any, any>> as any;
    handlerFalse = {
      canHandle: jest.fn().mockRejectedValue(new Error('test')),
    } satisfies Partial<AsyncHandler<any, any>> as any;
  });

  describe('#findHandler', (): void => {
    it('finds a matching handler.', async(): Promise<void> => {
      await expect(findHandler([ handlerFalse, handlerTrue ], null)).resolves.toBe(handlerTrue);
    });

    it('errors if there is no matching handler.', async(): Promise<void> => {
      const err = await getError(async(): Promise<any> => findHandler([ handlerFalse, handlerFalse ], null));
      const error = err as AggregateError;
      expect(error.message).toBe('No handler can handle the input');
      expect(error.errors).toHaveLength(2);
      expect(error.errors[0].message).toBe('test');
      expect(error.errors[1].message).toBe('test');
    });
  });

  describe('#filterHandlers', (): void => {
    it('finds matching handlers.', async(): Promise<void> => {
      await expect(filterHandlers([ handlerTrue, handlerFalse, handlerTrue ], null))
        .resolves.toEqual([ handlerTrue, handlerTrue ]);
    });

    it('errors if there is no matching handler.', async(): Promise<void> => {
      const err = await getError(async(): Promise<any> => filterHandlers([ handlerFalse, handlerFalse ], null));
      const error = err as AggregateError;
      expect(error.message).toBe('No handler can handle the input');
      expect(error.errors).toHaveLength(2);
      expect(error.errors[0].message).toBe('test');
      expect(error.errors[1].message).toBe('test');
    });
  });

  describe('#handleIfAble', (): void => {
    it('returns undefined if the handler cannot handle the input.', async(): Promise<void> => {
      await expect(handleIfAble(handlerFalse, 'a')).resolves.toBeUndefined();
    });

    it('returns the value if the handler can handle the input.', async(): Promise<void> => {
      await expect(handleIfAble(handlerTrue, 'a')).resolves.toBe(true);
    });
  });
});
