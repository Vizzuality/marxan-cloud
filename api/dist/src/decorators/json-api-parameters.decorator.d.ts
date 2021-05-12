export declare const JSONAPIQueryParams: (fetchConfiguration?: {
    entitiesAllowedAsIncludes?: string[] | undefined;
    availableFilters?: {
        name: string;
        description?: string | undefined;
        examples?: string[] | undefined;
    }[] | undefined;
} | undefined) => <TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol | undefined, descriptor?: TypedPropertyDescriptor<Y> | undefined) => void;
export declare const JSONAPISingleEntityQueryParams: (fetchConfiguration?: {
    entitiesAllowedAsIncludes?: string[] | undefined;
    availableFilters?: {
        name: string;
        description?: string | undefined;
        examples?: string[] | undefined;
    }[] | undefined;
} | undefined) => <TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol | undefined, descriptor?: TypedPropertyDescriptor<Y> | undefined) => void;
