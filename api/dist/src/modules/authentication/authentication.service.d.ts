import { JwtService } from '@nestjs/jwt';
import { User } from 'modules/users/user.api.entity';
import { UsersService } from 'modules/users/users.service';
import { Repository } from 'typeorm';
import { IssuedAuthnToken } from './issued-authn-token.api.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { ApiEventsService } from 'modules/api-events/api-events.service';
import * as ApiEventsUserData from 'modules/api-events/dto/apiEvents.user.data.dto';
export interface AccessToken {
    user: Partial<User>;
    accessToken: string;
}
export interface JwtDataPayload {
    sub: string;
    tokenId: string;
    iat: number;
    exp: number;
}
export declare class AuthenticationService {
    private readonly apiEventsService;
    private readonly usersService;
    private readonly jwtService;
    private readonly issuedAuthnTokensRepository;
    private readonly usersRepository;
    private readonly logger;
    constructor(apiEventsService: ApiEventsService, usersService: UsersService, jwtService: JwtService, issuedAuthnTokensRepository: Repository<IssuedAuthnToken>, usersRepository: Repository<User>);
    validateUser({ email, password, }: {
        email: string;
        password: string;
    }): Promise<User | null>;
    createUser(signupDto: SignUpDto): Promise<Partial<User>>;
    validateActivationToken(token: Pick<ApiEventsUserData.ActivationTokenGeneratedV1Alpha1, 'validationToken' | 'sub'>): Promise<true | never>;
    login(user: User): Promise<AccessToken>;
    findTokenById(tokenId: string): Promise<IssuedAuthnToken | undefined>;
    invalidateAllTokensOfUser(userId: string): Promise<void>;
    purgeExpiredIssuedTokens(): Promise<void>;
}
