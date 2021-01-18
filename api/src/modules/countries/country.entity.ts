import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('countries')
export class Country {
  @ApiProperty()
  @PrimaryColumn('character varying')
  @Transform((_) => fakerStatic.address.countryCode())
  id: string;

  @ApiProperty()
  @Column('character varying')
  @Transform((_) => fakerStatic.address.country())
  name: string;
}

export class JSONAPIData<Entity> {
  @ApiProperty()
  type: string = 'countries';

  @ApiProperty()
  id: string;

  @ApiProperty()
  attributes: Entity;
}

export class CountryResult {
  @ApiProperty()
  data: JSONAPIData<Country>;
}
