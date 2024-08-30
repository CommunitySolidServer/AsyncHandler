import { BaseErrorFactory } from '../../src/BaseErrorFactory';

describe('BaseErrorFactory', (): void => {
  it('returns an error with the input message.', async(): Promise<void> => {
    const factory = new BaseErrorFactory('test');
    expect(factory.create('input')).toEqual(new Error('input'));
  });

  it('returns an error with the constructor message if there is no input.', async(): Promise<void> => {
    const factory = new BaseErrorFactory('test');
    expect(factory.create()).toEqual(new Error('test'));
  });
});
