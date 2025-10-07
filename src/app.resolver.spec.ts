import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';

describe('AppResolver', () => {
  let appResolver: AppResolver;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AppResolver, AppService],
    }).compile();

    appResolver = app.get<AppResolver>(AppResolver);
  });

  describe('helloWorld', () => {
    it('should return "Hello World!"', () => {
      expect(appResolver.helloWorld()).toBe('Hello World!');
    });
  });
  describe('hello', () => {
    it('should return "Hello ${name}!"', () => {
      const name = faker.person.firstName();
      expect(appResolver.hello(name)).toBe(`Hello ${name}!`);
    });
  });
});
