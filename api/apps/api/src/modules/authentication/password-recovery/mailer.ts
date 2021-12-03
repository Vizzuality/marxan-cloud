import {
  FactoryProvider,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as Sparkpost from 'sparkpost';
import { CreateTransmission, Recipient } from 'sparkpost';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { UsersService } from '@marxan-api/modules/users/users.service';

enum SparkpostTemplate {
  PasswordChangedConfirmation = 'confirmation-password-changed',
  PasswordRecovery = 'marxan-reset-password',
  SignUpConfirmation = 'confirmation-account',
}

export abstract class Mailer {
  abstract sendRecoveryEmail(userId: string, token: string): Promise<void>;
  abstract sendPasswordChangedConfirmation(userId: string): Promise<void>;
  abstract sendSignUpConfirmationEmail(
    userId: string,
    token: string,
  ): Promise<void>;
}

export const sparkPostProvider: FactoryProvider<Sparkpost> = {
  provide: Sparkpost,
  useFactory: () => {
    const apikey = AppConfig.get<string>('sparkpost.apikey');
    const origin = AppConfig.get<string>('sparkpost.origin');
    return new Sparkpost(apikey, {
      origin,
    });
  },
};

const passwordResetPrefixToken = Symbol('password reset prefix token');
export const passwordResetPrefixProvider: FactoryProvider<string> = {
  provide: passwordResetPrefixToken,
  useFactory: () => {
    return AppConfig.get<string>('passwordReset.tokenPrefix');
  },
};

const signUpConfirmationPrefixToken = Symbol('sign-up confirm prefix token');
export const signUpConfirmationPrefixProvider: FactoryProvider<string> = {
  provide: signUpConfirmationPrefixToken,
  useFactory: () => AppConfig.get<string>('signUpConfirmation.tokenPrefix'),
};

@Injectable()
export class SparkPostMailer implements Mailer {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly sparkpost: Sparkpost,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(passwordResetPrefixToken)
    private readonly passwordResetPrefix: string,
  ) {}

  private async sendEmail(
    template: SparkpostTemplate,
    targetEmail: string,
    data: Record<string, any> = {},
  ): Promise<void> {
    const recipient: Recipient = {
      substitution_data: data,
      address: targetEmail,
    };

    const transmission: CreateTransmission = {
      recipients: [recipient],
      content: { template_id: template },
    };

    const result = await this.sparkpost.transmissions.send(transmission);
    this.logger.log(result);
  }

  async sendPasswordChangedConfirmation(userId: string): Promise<void> {
    const user = await this.usersService.getById(userId);
    return this.sendEmail(
      SparkpostTemplate.PasswordChangedConfirmation,
      user.email,
    );
  }

  async sendRecoveryEmail(userId: string, token: string): Promise<void> {
    const user = await this.usersService.getById(userId);
    return this.sendEmail(SparkpostTemplate.PasswordRecovery, user.email, {
      urlRecover: `${AppConfig.get('application.baseUrl')}${
        this.passwordResetPrefix
      }${token}`,
    });
  }

  async sendSignUpConfirmationEmail(
    userId: string,
    token: string,
  ): Promise<void> {
    const user = await this.usersService.getById(userId);
    return this.sendEmail(SparkpostTemplate.SignUpConfirmation, user.email, {
      urlSignUpConfirmation: `${AppConfig.get(
        'application.baseUrl',
      )}${AppConfig.get(
        'signUpConfirmation.tokenPrefix',
      )}${token}&userId=${userId}`,
    });
  }
}

export class ConsoleMailer implements Mailer {
  private logger = new Logger(this.constructor.name);

  async sendPasswordChangedConfirmation(userId: string): Promise<void> {
    this.logger.log(`sending password changed confirmation to user ${userId}`);
  }

  async sendRecoveryEmail(userId: string, token: string): Promise<void> {
    this.logger.log(
      `sending recovery email to user ${userId} with token ${token}`,
    );
  }

  async sendSignUpConfirmationEmail(
    userId: string,
    token: string,
  ): Promise<void> {
    this.logger.log(
      `Sending sign-up confirmation email to user ${userId} with token ${token}`,
    );
  }
}
