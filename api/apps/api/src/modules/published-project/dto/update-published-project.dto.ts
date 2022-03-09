import { PartialType } from '@nestjs/mapped-types';
import { PublishProjectDto } from './publish-project.dto';

export class UpdatePublishedProjectDto extends PartialType(PublishProjectDto) {
  isUnpublished?: boolean;
}
