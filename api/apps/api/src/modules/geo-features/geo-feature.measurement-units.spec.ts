import { transformMinMaxAmountsFromSquareMetresToSquareKmsForFeaturesFromShapefile } from './geo-feature.measurement-units';

describe('Geo Features - measurement units', () => {
  describe('Should convert square m to square km for non-legacy features', () => {
    it('Should convert to the nearest integer any values that are > 1 once converted', () => {
      const minMax =
        transformMinMaxAmountsFromSquareMetresToSquareKmsForFeaturesFromShapefile(
          { isLegacy: false, amountMin: 123456789, amountMax: 567891234 },
        );
      expect(minMax).toEqual({ min: 123, max: 568 });
    });

    it('Should convert to the nearest integer any values that are = 1 once converted', () => {
      const minMax =
        transformMinMaxAmountsFromSquareMetresToSquareKmsForFeaturesFromShapefile(
          { isLegacy: false, amountMin: 1000000, amountMax: 567891234 },
        );
      expect(minMax).toEqual({ min: 1, max: 568 });
    });

    it('Should round to the fourth decimal digit any min values that are < 1 once converted', () => {
      const minMax =
        transformMinMaxAmountsFromSquareMetresToSquareKmsForFeaturesFromShapefile(
          { isLegacy: false, amountMin: 123456, amountMax: 567891234 },
        );
      expect(minMax).toEqual({ min: 0.1235, max: 568 });
    });

    it('Should round to the fourth decimal digit any max values that are < 1 once converted', () => {
      const minMax =
        transformMinMaxAmountsFromSquareMetresToSquareKmsForFeaturesFromShapefile(
          { isLegacy: false, amountMin: 123456, amountMax: 234567 },
        );
      expect(minMax).toEqual({ min: 0.1235, max: 0.2346 });
    });
    it('Should handle zero values correctly', () => {
      const minMax =
        transformMinMaxAmountsFromSquareMetresToSquareKmsForFeaturesFromShapefile(
          { isLegacy: false, amountMin: 0, amountMax: 234567 },
        );
      expect(minMax).toEqual({ min: 0, max: 0.2346 });
    });
  });
  describe('Should not perform any conversion for legacy features', () => {
    it('Should leave integer values untouched', () => {
      const minMax =
        transformMinMaxAmountsFromSquareMetresToSquareKmsForFeaturesFromShapefile(
          { isLegacy: true, amountMin: 123456, amountMax: 234567 },
        );
      expect(minMax).toEqual({ min: 123456, max: 234567 });
    });
    it('Should not apply any rounding to decimal values', () => {
      const minMax =
        transformMinMaxAmountsFromSquareMetresToSquareKmsForFeaturesFromShapefile(
          { isLegacy: true, amountMin: 1.23456, amountMax: 2.34567 },
        );
      expect(minMax).toEqual({ min: 1.23456, max: 2.34567 });
    });
    it('Should handle zero values correctly', () => {
      const minMax =
        transformMinMaxAmountsFromSquareMetresToSquareKmsForFeaturesFromShapefile(
          { isLegacy: true, amountMin: 0, amountMax: 234567 },
        );
      expect(minMax).toEqual({ min: 0, max: 234567 });
    });
  });
});
