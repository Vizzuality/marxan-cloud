import { RequestWithAuthenticatedUser } from 'app.controller';
import { AccessToken, AuthenticationService } from './authentication.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UserAccountValidationDTO } from './dto/user-account.validation.dto';
export declare class AuthenticationController {
    private readonly authenticationService;
    constructor(authenticationService: AuthenticationService);
    login(req: RequestWithAuthenticatedUser, _dto: LoginDto): Promise<AccessToken>;
    logout(req: RequestWithAuthenticatedUser): Promise<void>;
    signUp(_req: Request, signupDto: SignUpDto): Promise<void>;
    confirm(activationToken: UserAccountValidationDTO): Promise<void>;
    refreshToken(req: RequestWithAuthenticatedUser): Promise<AccessToken>;
}
