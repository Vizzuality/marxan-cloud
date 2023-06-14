import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FeatureAmountUploadRegistry } from '@marxan-api/modules/geo-features/import/features-amounts-upload-registry.api.entity';

@Entity('features_amounts')
export class UploadedFeatureAmount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'feature_name' })
  featureName!: string;

  @Column()
  puid!: number;

  @Column()
  amount!: number;

  @ManyToOne(
    () => FeatureAmountUploadRegistry,
    (upload) => upload.uploadedFeatures,
  )
  @JoinColumn({ name: 'upload_id' })
  upload!: FeatureAmountUploadRegistry;
}
