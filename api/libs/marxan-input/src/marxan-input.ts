import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { MarxanParameters } from './marxan-parameters';

@Injectable()
export class MarxanInput {
  from(input: Partial<MarxanParameters>) {
    const params = plainToClass<MarxanParameters, MarxanParameters>(
      MarxanParameters,
      input,
    );
    const errors = validateSync(params, {
      whitelist: true,
    });

    if (errors.length > 0) {
      throw errors;
    }

    return params;
  }
}
