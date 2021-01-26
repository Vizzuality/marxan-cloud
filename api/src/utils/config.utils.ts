import { Logger } from '@nestjs/common';

import * as config from 'config';

/**
 * Utility functions related to app configuration.
 */
export class AppConfig {
  /**
   * Read a config value from a given config property; return defaultValue if
   * property does not exist.
   */
  static get<T>(property: string, defaultValue?: T): T | undefined {
    try {
      return config.has(property) ? config.get(property) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  /**
   * Compile list of config values from: 1. a config property as array of
   * values, and 2. a comma-separated list as string. The latter would typically
   * be a string read from an environment variable and mapped to a config
   * property.
   */
  static getFromArrayAndParsedString<T>(
    arrayProperty: string,
    stringProperty?: string,
  ): (T | string)[] {
    // Array from config property
    const valuesFromArray = this.get<T[]>(arrayProperty, []);
    let valuesFromParsedString: string[] = [];
    if (stringProperty) {
      // This may be a comma-separated list
      const valuesFromString = stringProperty ? this.get(stringProperty) : null;
      // If valuesFromString is a string, split it as comma-separated
      if (typeof valuesFromString === 'string') {
        valuesFromParsedString = valuesFromString.split(',');
      } else {
        Logger.warn(
          `Value of the ${stringProperty} config property should be a string, ${typeof valuesFromString} found: its contents will be ignored.`,
        );
      }
    }
    // Merge
    return valuesFromArray
      ? [...valuesFromArray, ...valuesFromParsedString]
      : [...valuesFromParsedString];
  }
}
