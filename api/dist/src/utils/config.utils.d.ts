export declare class AppConfig {
    static get<T>(property: string, defaultValue?: T): T | undefined;
    static getFromArrayAndParsedString<T>(arrayProperty: string, stringProperty?: string, defaultValue?: T): (T | string)[];
}
