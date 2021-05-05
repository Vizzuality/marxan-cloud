import { validateSync } from 'class-validator';
import {
  getDtoWithInvalidUuids,
  getDtoWithInvalidMultiPolygon,
} from './__mocks__/dtos.data';

describe(`when changing by id`, () => {
  describe(`when providing invalid uuid`, () => {
    it(`should return error`, () => {
      expect(
        validateSync(getDtoWithInvalidUuids())[0].children,
      ).toMatchSnapshot();
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
