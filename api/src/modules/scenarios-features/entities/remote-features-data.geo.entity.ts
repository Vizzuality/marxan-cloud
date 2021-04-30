import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const remoteFeaturesDataViewName = 'features_data';

@Entity(remoteFeaturesDataViewName)
export class RemoteFeaturesData {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  feature_id!: string;
}
