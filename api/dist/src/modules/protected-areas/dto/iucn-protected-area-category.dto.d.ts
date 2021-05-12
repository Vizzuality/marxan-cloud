import { IUCNCategory, ProtectedArea } from '../protected-area.geo.entity';
declare const IUCNProtectedAreaCategoryDTO_base: import("@nestjs/common").Type<Pick<ProtectedArea, "iucnCategory">>;
export declare class IUCNProtectedAreaCategoryDTO extends IUCNProtectedAreaCategoryDTO_base {
    iucnCategory: IUCNCategory;
}
export declare class JSONAPIIUCNProtectedAreaCategoryData {
    type: string;
    id: string;
    attributes: IUCNProtectedAreaCategoryDTO;
}
export declare class IUCNProtectedAreaCategoryResult {
    data: JSONAPIIUCNProtectedAreaCategoryData;
}
export {};
