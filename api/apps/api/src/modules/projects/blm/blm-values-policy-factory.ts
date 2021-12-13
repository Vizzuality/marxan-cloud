import { Injectable } from '@nestjs/common';
import { BlmValuesCalculator } from './domain/blm-values-calculator';

@Injectable()
export class BlmValuesPolicyFactory {
  get() {
    return new BlmValuesCalculator();
  }
}
