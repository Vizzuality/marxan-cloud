"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fakeQueryBuilder = void 0;
const fakeQueryBuilder = (getResultCallback) => ({
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(getResultCallback()),
    getMany: jest.fn().mockResolvedValue(getResultCallback()),
    getManyAndCount: jest.fn().mockResolvedValue(getResultCallback()),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getQueryAndParameters: jest.fn(),
});
exports.fakeQueryBuilder = fakeQueryBuilder;
//# sourceMappingURL=fake-query-builder.js.map