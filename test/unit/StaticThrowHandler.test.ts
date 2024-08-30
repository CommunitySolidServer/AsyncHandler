import type { ErrorFactory } from '../../src/ErrorFactory';
import { StaticThrowHandler } from '../../src/StaticThrowHandler';

describe('StaticThrowHandler', (): void => {
  it('can handle all requests if onlyHandle is true.', async(): Promise<void> => {
    let handler = new StaticThrowHandler();
    await expect(handler.canHandle()).resolves.toBeUndefined();

    handler = new StaticThrowHandler(false);
    await expect(handler.canHandle()).rejects.toThrow(Error);
  });

  it('throws an error with the given message.', async(): Promise<void> => {
    const handler = new StaticThrowHandler(false, 'message');
    await expect(handler.handle()).rejects.toThrow('message');
  });

  it('throws an error from the given factory.', async(): Promise<void> => {
    const factory: ErrorFactory = {
      create: jest.fn().mockReturnValue(new Error('factory')),
    };
    const handler = new StaticThrowHandler(false, 'message', factory);
    await expect(handler.handle()).rejects.toThrow('factory');
  });
});
