import { AuthenticationService } from 'modules/authentication/authentication.service';
import { User } from 'modules/users/user.api.entity';
import { Strategy } from 'passport-local';
declare const LocalStrategy_base: new (...args: any[]) => Strategy;
export declare class LocalStrategy extends LocalStrategy_base {
    private readonly authenticationService;
    constructor(authenticationService: AuthenticationService);
    validate(email: string, password: string): Promise<User>;
}
export {};
