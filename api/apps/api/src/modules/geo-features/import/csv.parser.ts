import { FeatureAmountCSVDto } from '@marxan-api/modules/geo-features/dto/feature-amount-csv.dto';
import { Stream } from 'stream';
import { parseStream } from 'fast-csv';
import { validateOrReject } from 'class-validator';
import { missingPuidColumn } from '@marxan-api/modules/geo-features/geo-features.service';
import { left } from 'fp-ts/Either';

export const nofeaturesFoundInCsv = Symbol('No features found in csv');

export const duplicateHeadersInCsv = Symbol('Duplicate headers found in csv');

export const duplicatePuidsInCsv = Symbol('Duplicate puids found in csv');

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
        const seenHeaders = new Set();
        for (const header of h) {
          if (seenHeaders.has(header)) {
            reject(left(duplicateHeadersInCsv));
          } else {
            seenHeaders.add(header);
          }
        }
        if (!h.includes('puid')) {
          reject(left(missingPuidColumn));
        }
        if (h.length < 2) {
          reject(left(nofeaturesFoundInCsv));
        }
      })
      .on('data', (data) => {
        const puid: number = parseInt(data.puid);
        if (seenPuids.has(puid)) {
          reject(duplicatePuidsInCsv);
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
