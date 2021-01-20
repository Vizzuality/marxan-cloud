import { PartialType } from '@nestjs/swagger';
import { CreateCountryDTO } from './create.country.dto';

export class UpdateCountryDTO extends PartialType(CreateCountryDTO) {}
