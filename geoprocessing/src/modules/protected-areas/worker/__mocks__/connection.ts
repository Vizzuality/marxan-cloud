import { Injectable } from '@nestjs/common';

@Injectable()
export class FakeConnection {
  deleteMock = jest.fn<any, any>(() => fail());
  insertMock = jest.fn<any, any>(() => fail());
  startTransactionMock = jest.fn();
  commitMock = jest.fn();
  rollbackMock = jest.fn();
  releaseMock = jest.fn();
  connectMock = jest.fn();

  createQueryRunner = () => ({
    connect: async () => this.connectMock(),
    startTransaction: async () => this.startTransactionMock(),
    commitTransaction: async () => this.commitMock(),
    rollbackTransaction: async () => this.rollbackMock(),
    release: async () => this.releaseMock(),
    manager: {
      delete: this.deleteMock,
      insert: this.insertMock,
    },
  });
}
