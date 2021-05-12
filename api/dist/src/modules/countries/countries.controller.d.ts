import { CountryResult } from './country.geo.entity';
import { CountriesService } from './countries.service';
import { FetchSpecification } from 'nestjs-base-service';
export declare class CountriesController {
    readonly service: CountriesService;
    constructor(service: CountriesService);
    findAll(fetchSpecification: FetchSpecification): Promise<CountryResult>;
    findOne(id: string): Promise<CountryResult>;
}
