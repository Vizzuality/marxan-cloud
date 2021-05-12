export const ExpectBadRequest = (outcome: unknown) =>
  expect(outcome).toMatchObject({
    errors: expect.arrayContaining([
      {
        meta: expect.any(Object),
        status: 500,
        title:
          'One or more of the planning units provided for exclusion or inclusion does not match any planning unit of the present scenario.',
      },
    ]),
  });
