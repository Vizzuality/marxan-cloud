import { Injectable } from '@nestjs/common';
import { CustomPlanningAreasUploader } from './custom-planning-areas-uploader.service';
import { AllPlanningAreasService } from './all-planning-areas.service';

@Injectable()
export class PlanningAreasService {
  constructor(
    private readonly uploader: CustomPlanningAreasUploader,
    private readonly allPlanningAreaService: AllPlanningAreasService,
  ) {}

  savePlanningAreaFromShapefile = this.uploader.savePlanningAreaFromShapefile.bind(
    this.uploader,
  );

  locatePlanningAreaEntity = this.allPlanningAreaService.locatePlanningAreaEntity.bind(
    this.allPlanningAreaService,
  );

  getPlanningAreaIdAndName = this.allPlanningAreaService.getPlanningAreaIdAndName.bind(
    this.allPlanningAreaService,
  );

  getPlanningAreaBBox = this.allPlanningAreaService.getPlanningAreaBBox.bind(
    this.allPlanningAreaService,
  );

  assignProject = this.allPlanningAreaService.assignProject.bind(
    this.allPlanningAreaService,
  );
}
