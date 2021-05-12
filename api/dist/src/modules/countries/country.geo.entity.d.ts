import { BaseServiceResource } from 'types/resource.interface';
export declare const countryResource: BaseServiceResource;
export declare class Country {
    id: string;
    gid0: string;
    name0: string;
    theGeom: any;
}
export declare class JSONAPICountryData {
    type: string;
    id: string;
    attributes: Country;
}
export declare class CountryResult {
    data: JSONAPICountryData;
}
