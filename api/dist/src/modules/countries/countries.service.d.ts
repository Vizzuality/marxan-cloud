import { AppInfoDTO } from 'dto/info.dto';
import { Repository } from 'typeorm';
import { Country } from './country.geo.entity';
import { CreateCountryDTO } from './dto/create.country.dto';
import { UpdateCountryDTO } from './dto/update.country.dto';
import { AppBaseService, JSONAPISerializerConfig } from 'utils/app-base.service';
export declare class CountriesService extends AppBaseService<Country, CreateCountryDTO, UpdateCountryDTO, AppInfoDTO> {
    private readonly countriesRepository;
    constructor(countriesRepository: Repository<Country>);
    get serializerConfig(): JSONAPISerializerConfig<Country>;
    fakeFindOne(_id: string): Promise<Country>;
}
