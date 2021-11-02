import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';

export class JSONAPIPublishedProjectData {
  @ApiProperty({
    type: String,
  })
  type = 'published-projects';

  @ApiProperty()
  id!: string;

  @ApiProperty({
    type: PublishedProject,
  })
  attributes!: PublishedProject;

  @ApiPropertyOptional()
  relationships?: Record<string, unknown>;
}

export class PublishedProjectResultSingular {
  @ApiProperty()
  data!: JSONAPIPublishedProjectData;
}

export class PublishedProjectResultPlural {
  @ApiProperty({
    isArray: true,
    type: JSONAPIPublishedProjectData,
  })
  data!: JSONAPIPublishedProjectData[];
}
