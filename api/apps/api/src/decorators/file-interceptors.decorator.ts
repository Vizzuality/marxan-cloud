import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadOptions } from '@marxan-api/utils/file-uploads.utils';
import {
  complexGeometry,
  complexGeometryWithProperties,
  simpleGeometry,
} from '@marxan-api/modules/uploads';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export enum GeometryKind {
  Simple = 'simple',
  Complex = 'complex',
  ComplexWithProperties = 'complex-with-properties',
}

const kindToSizeLimit: Record<GeometryKind, () => MulterOptions['limits']> = {
  [GeometryKind.Simple]: () => simpleGeometry(),
  [GeometryKind.Complex]: () => complexGeometry(),
  [GeometryKind.ComplexWithProperties]: () => complexGeometryWithProperties(),
};

export function GeometryFileInterceptor(kind: GeometryKind, fileName = 'file') {
  const limits = kindToSizeLimit[kind]();
  return applyDecorators(
    ...[
      UseInterceptors(
        FileInterceptor(fileName, {
          ...uploadOptions,
          limits,
        }),
      ),
    ],
  );
}
