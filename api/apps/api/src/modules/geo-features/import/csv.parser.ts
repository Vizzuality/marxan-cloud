import { FeatureAmountCSVDto } from '@marxan-api/modules/geo-features/dto/feature-amount-csv.dto';
import { Stream } from 'stream';
import { parseStream } from 'fast-csv';
import { validateOrReject } from 'class-validator';
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
    // TODO: we might want to accumulate all errors and retirve the offending line number
    const parsedData: FeatureAmountCSVDto[] = [];
    const seenPuids = new Set();
    const stream = new Stream.PassThrough();
    stream.end(fileBuffer);

    parseStream(stream, { headers: true })
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
            validateOrReject(featureAmount)
              .then(() => {
                parsedData.push(featureAmount);
              })
              .catch((err) => {
                reject(new Error(err));
              });
          }
        }
      })
      .on('end', () => {
        resolve(parsedData);
      })
      .on('error', reject);
  });
}
