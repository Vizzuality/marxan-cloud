import { Country } from 'modules/countries/country.geo.entity';
import { BaseServiceResource } from 'types/resource.interface';
export declare const adminAreaResource: BaseServiceResource;
export declare class AdminArea extends Country {
    id: string;
    gid0: string;
    gid1: string;
    name1: string;
    gid2?: string;
    name2?: string;
}
export declare class JSONAPIAdminAreaData {
    type: string;
    id: string;
    attributes: AdminArea;
}
export declare class AdminAreaResult {
    data: JSONAPIAdminAreaData;
}
