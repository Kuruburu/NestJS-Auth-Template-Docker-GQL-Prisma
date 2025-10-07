import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
  describe('hello/:name', () => {
    it('should return "Hello ${name}!"', () => {
      const name = faker.person.firstName();
      expect(appController.getHelloName(name)).toBe(`Hello ${name}!`);
    });
  });
});
