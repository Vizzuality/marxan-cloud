import { User } from '../modules/users/user.api.entity';
export declare abstract class TimeUserEntityMetadata {
    createdAt: Date;
    createdByUser: User;
    createdBy: string;
    lastModifiedAt: Date;
}
