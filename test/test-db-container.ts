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

export async function setupE2eTestApp() {
  const db = await setupTestDatabase();
  // override DATABASE_URL before Prisma boots
  process.env.DATABASE_URL = db.databaseUrl;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication<App> = moduleFixture.createNestApplication();
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
