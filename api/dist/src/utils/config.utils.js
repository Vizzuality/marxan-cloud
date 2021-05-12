"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfig = void 0;
const common_1 = require("@nestjs/common");
const config = require("config");
const lodash_1 = require("lodash");
class AppConfig {
    static get(property, defaultValue) {
        if (config.has(property)) {
            return config.get(property);
        }
        if (!lodash_1.isNil(defaultValue)) {
            return defaultValue;
        }
        throw new Error(`The environment variable for config property ${property} is not defined and no default was provided.`);
    }
    static getFromArrayAndParsedString(arrayProperty, stringProperty, defaultValue) {
        const valuesFromArray = this.get(arrayProperty, []);
        let valuesFromParsedString = [];
        if (stringProperty) {
            const valuesFromString = stringProperty
                ? this.get(stringProperty, defaultValue)
                : null;
            if (typeof valuesFromString === 'string') {
                valuesFromParsedString = valuesFromString.split(',');
            }
            else {
                common_1.Logger.warn(`Value of the ${stringProperty} config property should be a string, ${typeof valuesFromString} found: its contents will be ignored.`);
            }
        }
        return valuesFromArray
            ? [...valuesFromArray, ...valuesFromParsedString]
            : [...valuesFromParsedString];
    }
}
exports.AppConfig = AppConfig;
//# sourceMappingURL=config.utils.js.map