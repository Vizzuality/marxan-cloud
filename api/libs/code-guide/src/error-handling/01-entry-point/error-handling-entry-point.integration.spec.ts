import { Test } from '@nestjs/testing';
import { SomeController } from './controller';
import { BaseModule } from './base.module';

let sut: SomeController;

beforeEach(async () => {
  const app = await Test.createTestingModule({
    imports: [BaseModule],
  }).compile();
  sut = app.get(SomeController);
});

test(`doing stuff`, async () => {
  expect.assertions(1);
  try {
    await sut.doThings();
  } catch (error: any) {
    expect(error.toString()).toMatch(/You are not allowed/);
  }
});
