import { createClient } from './test-client-api';

describe('Foo', () => {
  it('works', async () => {
    const client = await createClient();
    const foo = await client.utils.createWorkingUser();

    console.log(foo);
    expect(1).toBe(1);
  });
});
