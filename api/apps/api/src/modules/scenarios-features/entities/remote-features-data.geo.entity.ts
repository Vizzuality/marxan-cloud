import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const remoteFeaturesDataViewName = 'features_data';

@Entity(remoteFeaturesDataViewName)
export class RemoteFeaturesData {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'feature_id' })
  featureId!: string;
}
