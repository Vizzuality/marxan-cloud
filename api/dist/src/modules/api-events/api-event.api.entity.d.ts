import { BaseServiceResource } from 'types/resource.interface';
export declare const apiEventResource: BaseServiceResource;
export declare enum API_EVENT_KINDS {
    user__signedUp__v1alpha1 = "user.signedUp/v1alpha1",
    user__accountActivationTokenGenerated__v1alpha1 = "user.accountActivationTokenGenerated/v1alpha1",
    user__accountActivationSucceeded__v1alpha1 = "user.accountActivationSucceeded/v1alpha1",
    user__accountActivationFailed__v1alpha1 = "user.accountActivationFailed/v1alpha1",
    user__passwordResetTokenGenerated__v1alpha1 = "user.passwordResetTokenGenerated/v1alpha1",
    user__passwordResetSucceeded__v1alpha1 = "user.passwordResetSucceeded/v1alpha1",
    user__passwordResetFailed__v1alpha1 = "user.passwordResetFailed/v1alpha1"
}
export interface QualifiedEventTopic {
    topic: string;
    kind: API_EVENT_KINDS;
}
export declare class ApiEvent {
    id: string;
    timestamp: Date;
    kind: string;
    topic: string;
    data: Record<string, unknown>;
}
export declare class JSONAPIApiEventData {
    type: string;
    id: string;
    attributes: ApiEvent;
}
export declare class ApiEventResult {
    data: JSONAPIApiEventData;
}
