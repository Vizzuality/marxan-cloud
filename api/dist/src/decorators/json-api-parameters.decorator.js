"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONAPISingleEntityQueryParams = exports.JSONAPIQueryParams = void 0;
const swagger_1 = require("@nestjs/swagger");
const nestjs_base_service_1 = require("nestjs-base-service");
const common_1 = require("@nestjs/common");
const includeQueryParam = (fetchConfiguration) => {
    var _a;
    return swagger_1.ApiQuery({
        name: 'include',
        description: ((_a = fetchConfiguration === null || fetchConfiguration === void 0 ? void 0 : fetchConfiguration.entitiesAllowedAsIncludes) === null || _a === void 0 ? void 0 : _a.length)
            ? `A comma-separated list of relationship paths. Allows the client to customize which related resources should be returned. Allowed values are: ${fetchConfiguration.entitiesAllowedAsIncludes
                .map((i) => '`' + i + '`')
                .join(', ')}.`
            : 'A comma-separated list of relationship paths. Allows the client to customize which related resources should be returned.',
        type: String,
        required: false,
    });
};
const filterQueryParam = (fetchConfiguration) => {
    var _a;
    return swagger_1.ApiQuery({
        name: 'filter',
        description: ((_a = fetchConfiguration === null || fetchConfiguration === void 0 ? void 0 : fetchConfiguration.availableFilters) === null || _a === void 0 ? void 0 : _a.length)
            ? `An array of filters (e.g. \`filter[keyA]=<value>&filter[keyB]=<value1>,<value2>...\`). Allows the client to request for specific filtering criteria to be applied to the request. Semantics of each set of filter key/values and of the set of filters as a whole depend on the specific request. Available filters: ${fetchConfiguration.availableFilters
                .map((i) => '`' + i.name + '`')
                .join(', ')}.`
            : 'An array of filters (e.g. `filter[keyA]=<value>&filter[keyB]=<value1>,<value2>...`). Allows the client to request for specific filtering criteria to be applied to the request. Semantics of each set of filter key/values and of the set of filters as a whole depend on the specific request.',
        type: String,
        isArray: true,
        required: false,
    });
};
const fieldsQueryParam = swagger_1.ApiQuery({
    name: 'fields',
    description: 'A comma-separated list that refers to the name(s) of the fields to be returned. An empty value indicates that all fields will be returned (less any fields specified as `omitFields`).',
    type: String,
    required: false,
});
const omitFieldsQueryParam = swagger_1.ApiQuery({
    name: 'omitFields',
    description: 'A comma-separated list that refers to the name(s) of fields to be omitted from the results. This could be useful as a shortcut when a specific field such as large geometry fields should be omitted, but it is not practical or not desirable to explicitly whitelist fields individually. An empty value indicates that no fields will be omitted (although they may still not be present in the result if an explicit choice of fields was provided via `fields`).',
    type: String,
    required: false,
});
const sortQueryParam = swagger_1.ApiQuery({
    name: 'sort',
    description: 'A comma-separated list of fields of the primary data according to which the results should be sorted. Sort order is ascending unless the field name is prefixed with a minus (for descending order).',
    type: String,
    required: false,
});
const pageSizeQueryParam = swagger_1.ApiQuery({
    name: 'page[size]',
    description: `Page size for pagination. If not supplied, pagination with default page size of ${nestjs_base_service_1.DEFAULT_PAGINATION.pageSize} elements will be applied.`,
    type: Number,
    required: false,
});
const pageNumberQueryParam = swagger_1.ApiQuery({
    name: 'page[number]',
    description: 'Page number for pagination. If not supplied, the first page of results will be returned.',
    type: Number,
    required: false,
});
const disablePaginationQueryParam = swagger_1.ApiQuery({
    name: 'disablePagination',
    description: `If set to \`true\`, pagination will be disabled. This overrides any other pagination query parameters, if supplied.`,
    type: Boolean,
    required: false,
});
const JSONAPIQueryParams = (fetchConfiguration) => common_1.applyDecorators(includeQueryParam(fetchConfiguration), filterQueryParam(fetchConfiguration), fieldsQueryParam, omitFieldsQueryParam, sortQueryParam, pageSizeQueryParam, pageNumberQueryParam, disablePaginationQueryParam);
exports.JSONAPIQueryParams = JSONAPIQueryParams;
const JSONAPISingleEntityQueryParams = (fetchConfiguration) => common_1.applyDecorators(includeQueryParam(fetchConfiguration), fieldsQueryParam, omitFieldsQueryParam);
exports.JSONAPISingleEntityQueryParams = JSONAPISingleEntityQueryParams;
//# sourceMappingURL=json-api-parameters.decorator.js.map