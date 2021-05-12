import { Repository } from 'typeorm';
import { User } from './user.api.entity';
import { CreateUserDTO } from './dto/create.user.dto';
import { UpdateUserDTO } from './dto/update.user.dto';
import { AppInfoDTO } from 'dto/info.dto';
import { AppBaseService, JSONAPISerializerConfig } from 'utils/app-base.service';
import { UpdateUserPasswordDTO } from './dto/update.user-password';
import { AuthenticationService } from 'modules/authentication/authentication.service';
export declare class UsersService extends AppBaseService<User, CreateUserDTO, UpdateUserDTO, AppInfoDTO> {
    protected readonly repository: Repository<User>;
    private readonly authenticationService;
    constructor(repository: Repository<User>, authenticationService: AuthenticationService);
    get serializerConfig(): JSONAPISerializerConfig<User>;
    fakeFindOne(_id: string): Promise<Partial<User>>;
    findByEmail(email: string): Promise<User | undefined>;
    static getSanitizedUserMetadata(user: User): Omit<User, 'passwordHash' | 'isActive' | 'isDeleted'>;
    markAsDeleted(userId: string): Promise<void>;
    updateOwnPassword(userId: string, currentAndNewPasswords: UpdateUserPasswordDTO, _info: AppInfoDTO): Promise<void>;
    validateBeforeUpdate(id: string, updateModel: UpdateUserDTO, _info?: AppInfoDTO): Promise<void>;
}
