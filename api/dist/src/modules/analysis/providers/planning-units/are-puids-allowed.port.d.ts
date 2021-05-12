export declare abstract class ArePuidsAllowedPort {
    abstract validate(scenarioId: string, puIds: string[]): Promise<{
        errors: unknown[];
    }>;
}
