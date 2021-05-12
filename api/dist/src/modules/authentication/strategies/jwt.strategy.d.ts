import { AuthenticationService, JwtDataPayload } from 'modules/authentication/authentication.service';
import { Strategy } from 'passport-jwt';
import { UsersService } from 'modules/users/users.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly authenticationService;
    private readonly usersService;
    constructor(authenticationService: AuthenticationService, usersService: UsersService);
    validate({ sub: email, tokenId }: JwtDataPayload): Promise<import("../../users/user.api.entity").User>;
}
export {};
