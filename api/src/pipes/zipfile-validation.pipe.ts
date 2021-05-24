import { ArgumentMetadata, PipeTransform } from '@nestjs/common';

export class ZipfileValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata): any {
    console.log('value', value);
    console.log('metadata', metadata);
    return value;
  }
}
