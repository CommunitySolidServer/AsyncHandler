import { ClassErrorFactory } from '../../src/ClassErrorFactory';

class DummyError extends Error {}

describe('ClassErrorFactory', (): void => {
  it('returns an error of the given type.', async(): Promise<void> => {
    const factory = new ClassErrorFactory(new DummyError());
    expect(factory.create()).toBeInstanceOf(DummyError);
  });
});
