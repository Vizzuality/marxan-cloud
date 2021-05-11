import { CustomOrigin } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AppConfig } from './config.utils';

export class CorsUtils {
  /**
   * Custom handler for CORS origins: we get all the configured allowed origins
   * via the app's configuration and authorize or deny the request based on
   * whether the origin matches the allowed origins.
   *
   * @debt This should be moved to a reusable module.
   */
  public static originHandler: CustomOrigin = (requestOrigin, callback) => {
    const whitelist = AppConfig.getFromArrayAndParsedString<string>(
      'network.cors.origins',
      'network.cors.origins_extra',
      '',
    );

    if (!requestOrigin) {
      callback(null, true);
      return;
    }

    let isValid = false;
    whitelist.forEach((regex) => {
      if (requestOrigin.match(regex)) {
        isValid = true;
      }
    });

    if (isValid) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  };
}
