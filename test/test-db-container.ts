import { StartedPostgreSqlContainer, PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import * as request from 'supertest';
import { Test as supertestTest } from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { App } from 'supertest/types';

export interface TestDatabase {
  container: StartedPostgreSqlContainer;
  databaseUrl: string;
}

export type GqlE2EClient = (query: string, variables?: Record<string, any>, token?: string) => supertestTest;

export async function setupTestDatabase(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer('postgres:17-alpine').start();

  const databaseUrl = container.getConnectionUri();

  // Run Prisma migrations against this DB
  execSync(`npx prisma migrate deploy`, {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });

  execSync(`npx prisma db seed`, {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });

  return { container, databaseUrl };
}
import { ValidationPipe } from '@nestjs/common';
import { getMetadataStorage } from 'class-validator';
import { ValidationMetadata } from 'class-validator/types/metadata/ValidationMetadata';

export function applyE2EValidationPipe(app: INestApplication) {
  // Remove UUID validations globally
  const metadata = getMetadataStorage();
  const original = metadata.getTargetValidationMetadatas.bind(metadata) as (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    targetConstructor: Function,
    targetSchema: string,
    always: boolean,
    strictGroups: boolean,
    groups?: string[],
  ) => ValidationMetadata[];
  metadata.getTargetValidationMetadatas = (targetConstructor, targetSchema, always, strictGroups) => {
    const metas = original(targetConstructor, targetSchema, always, strictGroups);
    return metas.filter((meta) => {
      return meta.name !== 'isUuid';
    });
  };

  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true,
      // forbidNonWhitelisted: true,
      // transform: true,
    }),
  );
}

export async function setupE2eTestApp() {
  const db = await setupTestDatabase();
  // override DATABASE_URL before Prisma boots
  process.env.DATABASE_URL = db.databaseUrl;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication<App> = moduleFixture.createNestApplication();
  applyE2EValidationPipe(app);
  await app.init();

  const httpServer = app.getHttpServer();

  const gql: GqlE2EClient = (query: string, variables = {}, token?: string) =>
    request(httpServer)
      .post('/graphql')
      .set('Authorization', token ? `Bearer ${token}` : '')
      .send({ query, variables });

  return {
    app,
    httpServer,
    db,
    gql,
  };
}
