import { TestClientApi } from './test-client-api';

describe('Foo', () => {
  it('works', async () => {
    const api = await TestClientApi.initialize();

    expect(1).toBe(1);
  });
});
