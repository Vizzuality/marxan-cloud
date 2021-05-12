export interface BaseServiceResource {
    className: string;
    name: {
        singular: string;
        plural: string;
    };
    entitiesAllowedAsIncludes?: string[];
    moduleControllerPrefix?: string;
}
