/// <reference types="jest" />
export declare const fakeQueryBuilder: <T>(getResultCallback: () => T) => {
    select: jest.Mock<any, any>;
    from: jest.Mock<any, any>;
    leftJoinAndSelect: jest.Mock<any, any>;
    where: jest.Mock<any, any>;
    andWhere: jest.Mock<any, any>;
    orderBy: jest.Mock<any, any>;
    getOne: jest.Mock<any, any>;
    getMany: jest.Mock<any, any>;
    getManyAndCount: jest.Mock<any, any>;
    take: jest.Mock<any, any>;
    skip: jest.Mock<any, any>;
    limit: jest.Mock<any, any>;
    getQueryAndParameters: jest.Mock<any, any>;
};
