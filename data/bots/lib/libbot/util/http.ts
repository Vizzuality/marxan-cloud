export class HttpUtils {
  static isResponseSuccessful(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 400;
  }
}
