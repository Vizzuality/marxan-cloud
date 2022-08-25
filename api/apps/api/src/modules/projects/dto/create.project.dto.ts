import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  registerDecorator,
  IsAlpha,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUppercase,
  IsUUID,
  Length,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { isUndefined } from 'lodash';

export function EitherCustomPlanningAreaOrGadmAreaMustBeSetButNotBoth(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'eitherCustomPlanningAreaOrGadmAreaMustBeSetButNotBoth',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(_value: any, args: ValidationArguments) {
          const {
            countryId,
            adminAreaLevel1Id,
            adminAreaLevel2Id,
            planningAreaId,
          } = args.object as CreateProjectDTO;

          // xor
          return (
            (isUndefined(countryId) &&
              isUndefined(adminAreaLevel1Id) &&
              isUndefined(adminAreaLevel2Id)) != isUndefined(planningAreaId)
          );
        },
      },
    });
  };
}

/**
 * @todo We have this dto partially duplicated in the geoprocessing service
 */
export class CreateProjectDTO {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsUUID()
  organizationId!: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  @EitherCustomPlanningAreaOrGadmAreaMustBeSetButNotBoth({
    message:
      'Either a custom planning area id or a GADM area must be set, but not both',
  })
  planningAreaId?: string;

  @ApiPropertyOptional({
    description: 'ISO 3166-1 alpha3 country code (uppercase)',
    example: 'ESP',
  })
  @IsAlpha()
  @IsUppercase()
  @Length(3, 3)
  @IsOptional()
  @EitherCustomPlanningAreaOrGadmAreaMustBeSetButNotBoth({
    message:
      'Either a custom planning area id or a GADM area must be set, but not both',
  })
  countryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @EitherCustomPlanningAreaOrGadmAreaMustBeSetButNotBoth({
    message:
      'Either a custom planning area id or a GADM area must be set, but not both',
  })
  adminAreaLevel1Id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @EitherCustomPlanningAreaOrGadmAreaMustBeSetButNotBoth({
    message:
      'Either a custom planning area id or a GADM area must be set, but not both',
  })
  adminAreaLevel2Id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Object.values(PlanningUnitGridShape))
  planningUnitGridShape?: PlanningUnitGridShape;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  planningUnitAreakm2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
