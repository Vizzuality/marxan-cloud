import { IsUUID } from 'class-validator';

export class JobOutput {
  /**
   * It may happen that there are hundreds of IDs
   * so please note that it may be wise NOT to use them
   * further down in queries - rather select them within SQL
   * using project_id
   */
  @IsUUID('all', {
    each: true,
  })
  geometryIds!: string[];

  @IsUUID()
  projectId!: string;
}
