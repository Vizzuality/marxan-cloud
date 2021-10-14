import { PromiseType } from 'utility-types';
import { Test } from '@nestjs/testing';
import * as uuid from 'uuid';
import { assertDefined } from '@marxan/utils';
import { left } from 'fp-ts/Either';
import {
  PasswordRecoveryService,
  tokenInvalid,
} from './password-recovery.service';
import { UserService } from './user.service';
import { Mailer } from './mailer';
import { TokenFactory } from './token.factory';
import { Token } from './token';
import { RecoveryTokenRepository } from './recovery-token.repository';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

let service: PasswordRecoveryService;

beforeEach(async () => {
  fixtures = await getFixtures();
  service = fixtures.getService();
});

test(`requesting password reset`, async () => {
  fixtures.sendingEnabled();

  fixtures.GivenAUser('user@email.com');
  await service.resetPassword('user@email.com');
  fixtures.ThenAnWithTokenEmailToUserWasSent('user@email.com');
});

test(`setting a new password`, async () => {
  fixtures.sendingConfirmationEnabled();

  fixtures.GivenAUser('user@email.com');
  const resetToken = await fixtures.givenAUserRequestedPasswordReset(
    'user@email.com',
  );
  await service.changePassword(resetToken, 'newPassword');
  fixtures.ThenNewUserPasswordIs('user@email.com', 'newPassword');
  fixtures.ThenNewPasswordConfirmationIsSend(`user@email.com`);
  fixtures.ThenUserIsLoggedOut(`user@email.com`);
});

test(`only newest token is valid`, async () => {
  fixtures.GivenAUser('user@email.com');
  const oldResetToken = await fixtures.givenAUserRequestedPasswordReset(
    `user@email.com`,
  );
  await fixtures.givenAUserRequestedPasswordReset(`user@email.com`);
  const result = await service.changePassword(oldResetToken, 'newPassword');
  expect(result).toStrictEqual(left(tokenInvalid));
  fixtures.ThenTheOldUserPasswordIsKept('user@email.com');
});

test(`token expirancy`, async () => {
  fixtures.GivenAUser('user@email.com');
  const resetToken = await fixtures.givenAUserRequestedPasswordReset(
    `user@email.com`,
  );
  const newDate = fixtures.GivenTimePassedToExpireToken();
  const result = await service.changePassword(
    resetToken,
    'newPassword',
    newDate,
  );
  expect(result).toStrictEqual(left(tokenInvalid));
  fixtures.ThenTheOldUserPasswordIsKept('user@email.com');
});

test(`not existing user`, () => {
  const service = fixtures.getService();
  service.resetPassword('user@email.com');
  fixtures.ThenNoEmailsSent();
});

test(`using a token twice`, async () => {
  fixtures.sendingConfirmationEnabled();

  fixtures.GivenAUser('user@email.com');
  const resetToken = await fixtures.givenAUserRequestedPasswordReset(
    'user@email.com',
  );
  await service.changePassword(resetToken, 'newPassword');
  const result = await service.changePassword(resetToken, 'newPassword2');
  fixtures.ThenNewUserPasswordIs('user@email.com', 'newPassword');
  expect(result).toStrictEqual(left(tokenInvalid));
});

async function getFixtures() {
  const fakeMailer: jest.Mocked<Mailer> = {
    sendRecoveryEmail: jest.fn<any, any>(fail),
    sendPasswordChangedConfirmation: jest.fn<any, any>(fail),
  };
  class FakeTokenFactory {
    count = 0;

    async create(userId: string): Promise<Token> {
      return {
        userId,
        createdAt: new Date(),
        expiredAt: new Date(+new Date() + 1000 * 6),
        value: 'aGeneratedToken' + this.count++,
      };
    }
  }
  class FakeUserRepository implements UserService {
    db: Record<
      string,
      | {
          id: string;
          password?: string;
          loggedIn: boolean;
        }
      | undefined
    > = {};

    async findUserId(email: string): Promise<string | undefined> {
      return this.db[email]?.id;
    }

    async logoutUser(userId: string): Promise<void> {
      const user = this.findUser(userId);
      if (user) user.loggedIn = false;
    }

    async setUserPassword(userId: string, password: string): Promise<void> {
      const user = this.findUser(userId);
      if (user) user.password = password;
    }

    private findUser(userId: string) {
      return Object.values(this.db).find((user) => user && user.id === userId);
    }
  }

  class FakeTokenRepository implements RecoveryTokenRepository {
    db: Record<string, Token | undefined> = {};

    async save(token: Token): Promise<any> {
      this.db[token.userId] = token;
    }

    async findAndDeleteToken(token: string): Promise<Token | undefined> {
      const entry = Object.entries(this.db).find(
        ([, entryToken]) => entryToken?.value === token,
      );
      if (!entry) return undefined;
      const [key, value] = entry;
      this.db[key] = undefined;
      return value;
    }
  }
  const testingModule = await Test.createTestingModule({
    providers: [
      PasswordRecoveryService,
      { provide: Mailer, useValue: fakeMailer },
      { provide: TokenFactory, useClass: FakeTokenFactory },
      FakeUserRepository,
      { provide: UserService, useExisting: FakeUserRepository },
      FakeTokenRepository,
      { provide: RecoveryTokenRepository, useExisting: FakeTokenRepository },
    ],
  }).compile();
  const fakeUserRepository = testingModule.get(FakeUserRepository);
  const fakeTokenRepository = testingModule.get(FakeTokenRepository);
  let tokenCount = 0;
  return {
    getService() {
      return testingModule.get(PasswordRecoveryService);
    },
    GivenAUser(email: string) {
      fakeUserRepository.db[email] = {
        id: uuid.v4(),
        loggedIn: true,
        password: 'defaultPassword',
      };
    },
    ThenAnWithTokenEmailToUserWasSent(email: string) {
      expect(fakeMailer.sendRecoveryEmail).toBeCalledTimes(1);
      expect(fakeMailer.sendRecoveryEmail).toBeCalledWith(
        fakeUserRepository.db[email]?.id,
        'aGeneratedToken' + tokenCount++,
      );
    },
    async givenAUserRequestedPasswordReset(email: string) {
      const sendMock = fakeMailer.sendRecoveryEmail;
      fakeMailer.sendRecoveryEmail = jest.fn();
      await service.resetPassword(email);
      fakeMailer.sendRecoveryEmail = sendMock;
      const id = fakeUserRepository.db[email]?.id;
      assertDefined(id);
      const token = fakeTokenRepository.db[id];
      assertDefined(token);
      return token.value;
    },
    sendingEnabled() {
      fakeMailer.sendRecoveryEmail.mockImplementation(async () => void 0);
    },
    ThenNewUserPasswordIs(email: string, password: string) {
      expect(fakeUserRepository.db[email]?.password).toBe(password);
    },
    ThenNewPasswordConfirmationIsSend(email: string) {
      expect(fakeMailer.sendPasswordChangedConfirmation).toBeCalledTimes(1);
      expect(fakeMailer.sendPasswordChangedConfirmation).toBeCalledWith(
        fakeUserRepository.db[email]?.id,
      );
    },
    ThenUserIsLoggedOut(email: string) {
      expect(fakeUserRepository.db[email]?.loggedIn).toBe(false);
    },
    ThenTheOldUserPasswordIsKept(email: string) {
      expect(fakeUserRepository.db[email]?.password).toBe('defaultPassword');
    },
    sendingConfirmationEnabled() {
      fakeMailer.sendPasswordChangedConfirmation.mockImplementation(
        async () => {
          //
        },
      );
    },
    ThenNoEmailsSent() {
      expect(fakeMailer.sendRecoveryEmail).toBeCalledTimes(0);
    },
    GivenTimePassedToExpireToken() {
      return new Date(+new Date() + 1000 * 6);
    },
  };
}
