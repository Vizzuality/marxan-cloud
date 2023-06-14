import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { UploadedFeatureAmount } from '@marxan-api/modules/geo-features/import/features-amounts-data.api.entity';

@Entity('feature_upload_registry')
export class FeatureAmountUploadRegistry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'project_id' })
  projectId!: string;

  @CreateDateColumn()
  timestamp!: Date;

  @Column({ name: 'user_id' })
  userId!: string;

  @OneToMany(
    () => UploadedFeatureAmount,
    (uploadedFeature) => uploadedFeature.upload,
    { cascade: true },
  )
  uploadedFeatures!: UploadedFeatureAmount[];
}
