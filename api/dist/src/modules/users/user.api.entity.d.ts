import { IssuedAuthnToken } from '../authentication/issued-authn-token.api.entity';
import { Dictionary } from 'lodash';
import { Project } from '../projects/project.api.entity';
import { Scenario } from '../scenarios/scenario.api.entity';
import { BaseServiceResource } from '../../types/resource.interface';
export declare const userResource: BaseServiceResource;
export declare class User {
    id: string;
    email: string;
    displayName?: string | null;
    fname?: string | null;
    lname?: string | null;
    avatarDataUrl?: string;
    passwordHash: string;
    metadata?: Dictionary<string>;
    isActive: boolean;
    isDeleted: boolean;
    projects: Project[];
    scenarios: Scenario[];
    issuedAuthnTokens?: IssuedAuthnToken[];
}
export declare class JSONAPIUserData {
    type: string;
    id: string;
    attributes: User;
}
export declare class UserResult {
    data: JSONAPIUserData;
}
