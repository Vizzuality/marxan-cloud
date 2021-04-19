import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { E2E_CONFIG } from './e2e.config';

describe('JSON API Specs (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });
  it('should return a error response shaped as JSON:API spec', async ()=>{
 
    const response = await  request(app.getHttpServer())
    .post('/auth/sign-in')
    .send({username: 'fakeuser@example.com', password: 'fakePassword'})
    console.log(response.body)
  })

  



  
});
