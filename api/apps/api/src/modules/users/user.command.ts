import { Command, Console } from 'nestjs-console';
import { Injectable, Logger } from '@nestjs/common';
import { AuthenticationService } from '@marxan-api/modules/authentication/authentication.service';
import { SignUpDto } from '@marxan-api/modules/authentication/dto/sign-up.dto';
import { validate } from 'class-validator';
import { User } from '@marxan-api/modules/users/user.api.entity';

@Injectable()
@Console()
export class UserCommand {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Command({
    command: 'create:user <email> <password>',
    description: 'create a user',
    options: [
      {
        flags: '-f, --firstname <firstname>',
        required: false,
      },
      {
        flags: '-l, --lastname <lastname>',
        required: false,
      },
      {
        flags: '-d, --displayname <displayname>',
        required: false,
      },
    ],
  })
  async create(
    email: string,
    password: string,
    options: { firstname?: string; lastname?: string; displayname?: string },
  ): Promise<void> {
    const newUser: SignUpDto = new SignUpDto();
    newUser.email = email;
    newUser.password = password;
    if (options.firstname) {
      newUser.fname = options.firstname;
    }
    if (options.lastname) {
      newUser.lname = options.lastname;
    }
    if (options.displayname) {
      newUser.displayName = options.displayname;
    }
    validate(newUser).then((errors: any) => {
      const logger: Logger = new Logger();
      if (errors.length > 0) {
        logger.error(`Validation errors:`);
        for (const error of errors) {
          logger.error(`Property: ${error.property}`);
          for (const [key, value] of Object.entries(error.constraints)) {
            logger.error(`${key} : ${value}`);
          }
        }
        process.exit(1);
      }
    });

    const user: Partial<User> = await this.authenticationService.createCLIUser(
      newUser,
    );

    console.log(
      `User account created. You can now login using '${user.email}' and your password.`,
    );
  }
}
