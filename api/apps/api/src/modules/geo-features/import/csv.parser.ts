import { FeatureAmountCSVDto } from '@marxan-api/modules/geo-features/dto/feature-amount-csv.dto';
import { Readable } from 'stream';
import { parseStream } from 'fast-csv';
import { validateSync } from 'class-validator';
import { missingPuidColumnInFeatureAmountCsvUpload } from '@marxan-api/modules/geo-features/geo-features.service';
import { left } from 'fp-ts/Either';

export const noFeaturesFoundInInFeatureAmountCsvUpload = Symbol(
  'No features found in feature amount csv upload',
);

export const duplicateHeadersInFeatureAmountCsvUpload = Symbol(
  'Duplicate headers found in feature amount csv upload',
);

export const duplicatePuidsInFeatureAmountCsvUpload = Symbol(
  'Duplicate puids found in feature amount csv upload',
);

export async function featureAmountCsvParser(
  fileBuffer: Buffer,
): Promise<FeatureAmountCSVDto[]> {
  return new Promise((resolve, reject) => {
    // @todo: we might want to accumulate all errors and retrieve the offending line number
    const parsedData: FeatureAmountCSVDto[] = [];
    const seenPuids = new Set();

    parseStream(Readable.from(fileBuffer), { headers: true })
      .on('headers', (h) => {
        const uniqueHeaders = [...new Set(h)];
        if (uniqueHeaders.length !== h.length) {
          reject(left(duplicateHeadersInFeatureAmountCsvUpload));
        }
        if (!h.includes('puid')) {
          reject(left(missingPuidColumnInFeatureAmountCsvUpload));
        }
        if (h.length < 2) {
          reject(left(noFeaturesFoundInInFeatureAmountCsvUpload));
        }
      })
      .on('data', (data) => {
        const puid: number = parseInt(data.puid);
        if (seenPuids.has(puid)) {
          reject(duplicatePuidsInFeatureAmountCsvUpload);
        }
        seenPuids.add(puid);
        for (const key in data) {
          if (key !== 'puid') {
            const featureAmount = new FeatureAmountCSVDto({
              puid,
              featureName: key,
              amount: parseFloat(data[key]),
            });
            const validationErrors = validateSync(featureAmount);
            if (validationErrors.length > 0) {
              reject(validationErrors);
            }
            parsedData.push(featureAmount);
          }
        }
      })
      .on('end', () => resolve(parsedData))
      .on('error', reject);
  });
}
