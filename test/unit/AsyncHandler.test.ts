import { AsyncHandler } from '../../src/AsyncHandler';

class DummyHandler extends AsyncHandler<any, any> {
  public async handle(input: any): Promise<void> {
    return input;
  }
}

describe('AsyncHandler', (): void => {
  it('supports any input by default.', async(): Promise<void> => {
    class EmptyHandler<T> extends AsyncHandler<T, null> {
      public async handle(): Promise<null> {
        return null;
      }
    }
    const handler = new EmptyHandler<string>();
    await expect(handler.canHandle('test')).resolves.toBeUndefined();
  });

  it('calls canHandle and handle when handleSafe is called.', async(): Promise<void> => {
    const handler = new DummyHandler();
    jest.spyOn(handler, 'canHandle').mockImplementation(async(input: any): Promise<void> => input);
    jest.spyOn(handler, 'handle').mockImplementation(async(input: any): Promise<any> => input);

    await expect(handler.handleSafe('test')).resolves.toBe('test');
    expect(handler.canHandle).toHaveBeenCalledTimes(1);
    expect(handler.handle).toHaveBeenCalledTimes(1);
  });

  it('does not call handle when canHandle errors during a handleSafe call.', async(): Promise<void> => {
    const handler = new DummyHandler();
    jest.spyOn(handler, 'canHandle').mockImplementation(async(): Promise<never> => {
      throw new Error('test');
    });
    jest.spyOn(handler, 'handle').mockImplementation(async(input: any): Promise<any> => input);

    await expect(handler.handleSafe('test')).rejects.toThrow(Error);
    expect(handler.canHandle).toHaveBeenCalledTimes(1);
    expect(handler.handle).toHaveBeenCalledTimes(0);
  });
});
