import type { AsyncHandler } from '../../src/AsyncHandler';
import { UnionHandler } from '../../src/UnionHandler';
import { getError } from '../TestUtil';

class SimpleUnionHandler extends UnionHandler<AsyncHandler<any, string>> {
  protected async combine(results: string[]): Promise<string> {
    return results.join('');
  }
}

describe('UnionHandler', (): void => {
  const input = { data: 'text' };
  let handlers: jest.Mocked<AsyncHandler<any, string>>[];
  let handler: SimpleUnionHandler;

  beforeEach(async(): Promise<void> => {
    handlers = [
      { canHandle: jest.fn(), handle: jest.fn().mockResolvedValue('a') } as any,
      { canHandle: jest.fn(), handle: jest.fn().mockResolvedValue('b') } as any,
    ];

    handler = new SimpleUnionHandler(handlers);
  });

  it('can handle a request if at least one extractor can handle it.', async(): Promise<void> => {
    await expect(handler.canHandle(input)).resolves.toBeUndefined();

    handlers[0].canHandle.mockRejectedValue(new Error('bad request'));
    await expect(handler.canHandle(input)).resolves.toBeUndefined();

    handlers[1].canHandle.mockRejectedValue(new Error('bad request'));
    let err = await getError(async(): Promise<void> => handler.canHandle(input));
    let error = err as AggregateError;
    expect(error.message).toBe('No handler can handle the input');
    expect(error.errors).toHaveLength(2);
    expect(error.errors[0].message).toBe('bad request');
    expect(error.errors[1].message).toBe('bad request');

    err = await getError(async(): Promise<any> => handler.handleSafe(input));
    error = err as AggregateError;
    expect(error.message).toBe('No handler can handle the input');
    expect(error.errors).toHaveLength(2);
    expect(error.errors[0].message).toBe('bad request');
    expect(error.errors[1].message).toBe('bad request');
  });

  it('requires all handlers to support the input if requireAll is true.', async(): Promise<void> => {
    handler = new SimpleUnionHandler(handlers, true);
    await expect(handler.canHandle(input)).resolves.toBeUndefined();

    handlers[0].canHandle.mockRejectedValue(new Error('bad request'));

    let err = await getError(async(): Promise<void> => handler.canHandle(input));
    let error = err as AggregateError;
    expect(error.message).toBe('No handler can handle the input');
    expect(error.errors).toHaveLength(1);
    expect(error.errors[0].message).toBe('bad request');

    err = await getError(async(): Promise<any> => handler.handleSafe(input));
    error = err as AggregateError;
    expect(error.message).toBe('No handler can handle the input');
    expect(error.errors).toHaveLength(1);
    expect(error.errors[0].message).toBe('bad request');
  });

  it('calls all handlers that support the input.', async(): Promise<void> => {
    handlers[0].canHandle.mockRejectedValue(new Error('bad request'));
    await expect(handler.handle(input)).resolves.toBe('b');
    await expect(handler.handleSafe(input)).resolves.toBe('b');
  });

  it('calls all handlers if requireAll is true.', async(): Promise<void> => {
    handler = new SimpleUnionHandler(handlers, true);
    await expect(handler.handleSafe(input)).resolves.toBe('ab');

    // `handle` call does not need to check `canHandle` values anymore
    handlers[0].canHandle.mockRejectedValue(new Error('bad request'));
    await expect(handler.handle(input)).resolves.toBe('ab');
  });

  it('requires all handlers to succeed if requireAll is true.', async(): Promise<void> => {
    handler = new SimpleUnionHandler(handlers, true);

    handlers[0].handle.mockRejectedValue(new Error('bad request'));

    const err = await getError(async(): Promise<any> => handler.handleSafe(input));
    const error = err as AggregateError;
    expect(error.message).toBe('No handler can handle the input');
    expect(error.errors).toHaveLength(1);
    expect(error.errors[0].message).toBe('bad request');
  });

  it('does not require all handlers to succeed if ignoreErrors is true.', async(): Promise<void> => {
    handler = new SimpleUnionHandler(handlers, true, true);

    handlers[0].handle.mockRejectedValueOnce(new Error('bad request'));
    await expect(handler.handleSafe(input)).resolves.toBe('b');

    handlers[1].handle.mockRejectedValueOnce(new Error('bad request'));
    await expect(handler.handleSafe(input)).resolves.toBe('a');

    handlers[0].handle.mockRejectedValueOnce(new Error('bad request'));
    handlers[1].handle.mockRejectedValueOnce(new Error('bad request'));
    await expect(handler.handleSafe(input)).resolves.toBe('');
  });
});
