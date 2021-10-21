import { FactoryProvider, Inject, Injectable, Logger } from '@nestjs/common';
import * as Sparkpost from 'sparkpost';
import { CreateTransmission, Recipient } from 'sparkpost';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { UsersService } from '@marxan-api/modules/users/users.service';

export abstract class Mailer {
  abstract sendRecoveryEmail(userId: string, token: string): Promise<void>;

  abstract sendPasswordChangedConfirmation(userId: string): Promise<void>;
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
    const prefix = AppConfig.get<string>('passwordReset.tokenPrefix');
    return prefix;
  },
};

@Injectable()
export class SparkPostMailer implements Mailer {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly sparkpost: Sparkpost,
    private readonly usersService: UsersService,
    @Inject(passwordResetPrefixToken)
    private readonly passwordResetPrefix: string,
  ) {}
  async sendPasswordChangedConfirmation(userId: string): Promise<void> {
    const user = await this.usersService.getById(userId);
    const recipient: Recipient = {
      address: user.email,
    };
    const transmission: CreateTransmission = {
      recipients: [recipient],
      content: {
        template_id: 'confirmation-password-changed',
      },
    };
    const result = await this.sparkpost.transmissions.send(transmission);
    this.logger.log(result);
  }

  async sendRecoveryEmail(userId: string, token: string): Promise<void> {
    const user = await this.usersService.getById(userId);
    const recipient: Recipient = {
      substitution_data: {
        urlRecover: this.passwordResetPrefix + token,
      },
      address: user.email,
    };
    const transmission: CreateTransmission = {
      recipients: [recipient],
      content: {
        template_id: 'marxan-reset-password',
      },
    };
    const result = await this.sparkpost.transmissions.send(transmission);
    this.logger.log(result);
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
}
