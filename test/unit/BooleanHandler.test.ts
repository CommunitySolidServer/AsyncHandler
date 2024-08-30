import { AsyncHandler } from '../../src/AsyncHandler';
import { BooleanHandler } from '../../src/BooleanHandler';
import { getError } from '../TestUtil';

class DummyHandler extends AsyncHandler<any, any> {
  public result: any;
  public constructor(result?: any) {
    super();
    this.result = result;
  }

  public async handle(): Promise<any> {
    return this.result;
  }
}

describe('BooleanHandler', (): void => {
  let handlerFalse: AsyncHandler<any, any>;
  let handlerTrue: AsyncHandler<any, any>;
  let handlerError: AsyncHandler<any, any>;
  let handlerCanNotHandle: AsyncHandler<any, any>;

  beforeEach(async(): Promise<void> => {
    handlerFalse = new DummyHandler(false);
    handlerTrue = new DummyHandler(true);
    handlerError = new DummyHandler();
    jest.spyOn(handlerError, 'handle').mockImplementation(async(): Promise<never> => {
      throw new Error('test');
    });
    handlerCanNotHandle = new DummyHandler();
    jest.spyOn(handlerCanNotHandle, 'canHandle').mockImplementation(async(): Promise<never> => {
      throw new Error('test');
    });
  });

  it('can handle the input if any of its handlers can.', async(): Promise<void> => {
    const handler = new BooleanHandler([ handlerFalse, handlerCanNotHandle ]);
    await expect(handler.canHandle(null)).resolves.toBeUndefined();
  });

  it('errors if none of its handlers supports the input.', async(): Promise<void> => {
    const handler = new BooleanHandler([ handlerCanNotHandle, handlerCanNotHandle ]);
    const err = await getError(async(): Promise<void> => handler.canHandle(null));
    const error = err as AggregateError;
    expect(error.message).toBe('No handler can handle the input');
    expect(error.errors).toHaveLength(2);
    expect(error.errors[0].message).toBe('test');
    expect(error.errors[1].message).toBe('test');
  });

  it('returns true if any of its handlers returns true.', async(): Promise<void> => {
    const handler = new BooleanHandler([ handlerFalse, handlerTrue, handlerCanNotHandle ]);
    await expect(handler.handle(null)).resolves.toBe(true);
  });

  it('returns false if none of its handlers returns true.', async(): Promise<void> => {
    const handler = new BooleanHandler([ handlerFalse, handlerError, handlerCanNotHandle ]);
    await expect(handler.handle(null)).resolves.toBe(false);
  });

  it('throw an internal error when calling handle with unsupported input.', async(): Promise<void> => {
    const handler = new BooleanHandler([ handlerCanNotHandle, handlerCanNotHandle ]);
    await expect(handler.handle(null)).rejects.toThrow('All handlers failed');
  });

  it('returns the same handle results with handleSafe.', async(): Promise<void> => {
    const handler = new BooleanHandler([ handlerFalse, handlerTrue, handlerCanNotHandle ]);
    await expect(handler.handleSafe(null)).resolves.toBe(true);
  });

  it('throws the canHandle error when calling handleSafe with unsupported input.', async(): Promise<void> => {
    const handler = new BooleanHandler([ handlerCanNotHandle, handlerCanNotHandle ]);

    const err = await getError(async(): Promise<any> => handler.handleSafe(null));
    const error = err as AggregateError;
    expect(error.message).toBe('No handler can handle the input');
    expect(error.errors).toHaveLength(2);
    expect(error.errors[0].message).toBe('test');
    expect(error.errors[1].message).toBe('test');
  });
});
