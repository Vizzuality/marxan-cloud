import { User, UserResult } from './user.api.entity';
import { UsersService } from './users.service';
import { RequestWithAuthenticatedUser } from 'app.controller';
import { FetchSpecification } from 'nestjs-base-service';
import { UpdateUserDTO } from './dto/update.user.dto';
import { UpdateUserPasswordDTO } from './dto/update.user-password';
export declare class UsersController {
    readonly service: UsersService;
    constructor(service: UsersService);
    findAll(fetchSpecification: FetchSpecification): Promise<User[]>;
    updateOwnPassword(dto: UpdateUserPasswordDTO, req: RequestWithAuthenticatedUser): Promise<void>;
    update(dto: UpdateUserDTO, req: RequestWithAuthenticatedUser): Promise<UserResult>;
    userMetadata(req: RequestWithAuthenticatedUser): Promise<UserResult>;
    deleteOwnUser(req: RequestWithAuthenticatedUser): Promise<void>;
}
