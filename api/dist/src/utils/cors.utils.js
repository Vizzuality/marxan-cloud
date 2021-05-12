"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorsUtils = void 0;
const config_utils_1 = require("./config.utils");
class CorsUtils {
}
exports.CorsUtils = CorsUtils;
CorsUtils.originHandler = (requestOrigin, callback) => {
    const whitelist = config_utils_1.AppConfig.getFromArrayAndParsedString('network.cors.origins', 'network.cors.origins_extra', '');
    if (!requestOrigin) {
        callback(null, true);
        return;
    }
    let isValid = false;
    whitelist.forEach((regex) => {
        if (requestOrigin.match(regex)) {
            isValid = true;
        }
    });
    if (isValid) {
        callback(null, true);
    }
    else {
        callback(new Error('Not allowed by CORS'));
    }
};
//# sourceMappingURL=cors.utils.js.map