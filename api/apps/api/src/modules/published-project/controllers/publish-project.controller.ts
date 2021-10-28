import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PublishedProjectService } from '../published-project.service';
import { PublishProjectDto } from '../dto/publish-project.dto';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { projectResource } from '@marxan-api/modules/projects/project.api.entity';
import { apiGlobalPrefixes } from '@marxan-api/api.config';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class PublishProjectController {
  constructor(
    private readonly publishedProjectService: PublishedProjectService,
  ) {}

  @Post(':id/publish')
  @ApiNoContentResponse()
  async publish(
    @Param('id') id: string,
    @Body() createPublishedProjectDto: PublishProjectDto,
  ): Promise<void> {
    await this.publishedProjectService.publish(id);
  }
}
