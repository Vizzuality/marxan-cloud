"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiConsumesShapefile = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shapefile_geojson_response_dto_1 = require("../modules/scenarios/dto/shapefile.geojson.response.dto");
function ApiConsumesShapefile() {
    return common_1.applyDecorators(swagger_1.ApiOperation({
        description: 'Upload Zip file containing .shp, .dbj, .prj and .shx files',
    }), swagger_1.ApiConsumes('multipart/form-data'), swagger_1.ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'Zip file containing .shp, .dbj, .prj and .shx files',
                    format: 'binary',
                },
            },
        },
    }), swagger_1.ApiOkResponse({ type: shapefile_geojson_response_dto_1.ShapefileGeoJSONResponseDTO }));
}
exports.ApiConsumesShapefile = ApiConsumesShapefile;
//# sourceMappingURL=shapefile.decorator.js.map