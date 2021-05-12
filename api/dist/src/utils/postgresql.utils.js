"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSQLUtils = void 0;
const typeorm_1 = require("typeorm");
class PostgreSQLUtils {
    static async version13Plus() {
        const postgresqlMajorVersion = await typeorm_1.getManager()
            .query('show server_version')
            .then((result) => {
            return result[0].server_version.split('.')[0];
        })
            .then((majorVersion) => Number(majorVersion));
        return postgresqlMajorVersion >= 13;
    }
}
exports.PostgreSQLUtils = PostgreSQLUtils;
//# sourceMappingURL=postgresql.utils.js.map