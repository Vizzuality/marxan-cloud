export declare enum IUCNCategory {
    Ia = "Ia",
    Ib = "Ib",
    II = "II",
    III = "III",
    IV = "IV",
    V = "V",
    VI = "VI",
    NotApplicable = "Not Applicable",
    NotAssigned = "Not Assigned",
    NotReported = "Not Reported"
}
export declare class ProtectedArea {
    id: string;
    wdpaId?: number;
    fullName?: string;
    iucnCategory?: IUCNCategory;
    shapeLength?: number;
    shapeArea?: number;
    countryId?: string;
    status?: string;
    designation?: string;
    theGeom?: Record<string, unknown>;
}
export declare class JSONAPIProtectedAreaData {
    type: string;
    id: string;
    attributes: ProtectedArea;
}
export declare class ProtectedAreaResult {
    data: JSONAPIProtectedAreaData;
}
