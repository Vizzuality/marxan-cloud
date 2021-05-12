"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadOptions = void 0;
const config_utils_1 = require("./config.utils");
const multer = require("multer");
const uuid_1 = require("uuid");
exports.uploadOptions = {
    storage: multer.diskStorage({
        filename: (_req, file, cb) => {
            cb(null, `${uuid_1.v4()}_${file.originalname}`);
        },
    }),
    limits: {
        fileSize: (() => {
            const fileUploadsSizeLimitMebibytes = config_utils_1.AppConfig.get('fileUploads.limits.fileSize', 50 * 1024e2);
            return fileUploadsSizeLimitMebibytes;
        })(),
    },
};
//# sourceMappingURL=file-uploads.utils.js.map