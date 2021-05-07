import { validateSync } from 'class-validator';
import {
  getDtoWithInvalidUuids,
  getDtoWithInvalidMultiPolygon,
} from './__mocks__/dtos.data';

describe(`when changing by id`, () => {
  describe(`when providing invalid uuid`, () => {
    it(`should return error`, () => {
      const result = validateSync(getDtoWithInvalidUuids())[0].children[0];
      expect(result.constraints).toMatchInlineSnapshot(`
        Object {
          "isUuid": "each value in include must be an UUID",
        }
      `);
      expect(result.value).toMatchInlineSnapshot(`
        Array [
          "non-uuid",
        ]
      `);
    });
  });
});

describe(`when changing by geo`, () => {
  describe(`when providing invalid shape`, () => {
    it(`should return error`, () => {
      expect(
        validateSync(getDtoWithInvalidMultiPolygon())[0].children,
      ).toMatchSnapshot();
    });
  });
});
