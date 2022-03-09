import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { registerDecorator, ValidationArguments } from 'class-validator';
import { CreateProjectDTO } from '../dto/create.project.dto';

export function ProjectHasPlanningAreaIdOrGadmIdIfGridIsGenerated() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'hasPlanningAreaIdOrGadmId',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const {
            planningAreaId,
            countryId,
            adminAreaLevel1Id,
            adminAreaLevel2Id,
          } = args.object as CreateProjectDTO;
          if (
            value &&
            [
              PlanningUnitGridShape.Hexagon,
              PlanningUnitGridShape.Square,
            ].includes(value)
          ) {
            return Boolean(
              planningAreaId ||
                countryId ||
                (countryId && adminAreaLevel1Id) ||
                (countryId && adminAreaLevel1Id && adminAreaLevel2Id),
            );
          }
          return true;
        },
        defaultMessage(_args: ValidationArguments) {
          return 'When a regular planning grid is requested (hexagon or square) either a custom planning area or a GADM area gid must be provided.';
        },
      },
    });
  };
}
