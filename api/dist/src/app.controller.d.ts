import { User } from 'modules/users/user.api.entity';
import { AppService } from './app.service';
export interface RequestWithAuthenticatedUser extends Request {
    user: User;
}
export declare class AppController {
    private readonly _service;
    constructor(_service: AppService);
}
