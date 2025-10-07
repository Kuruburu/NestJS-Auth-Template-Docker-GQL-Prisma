/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { LoginInput } from 'src/auth/dto/login.input';
import { RefreshTokenInput } from 'src/auth/dto/refresh-token.input';
import { GqlE2EClient, setupE2eTestApp, TestDatabase } from '../test-db-container';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let gql: GqlE2EClient;
  let db: TestDatabase;

  beforeAll(async () => {
    const result = await setupE2eTestApp();
    app = result.app;
    gql = result.gql;
    db = result.db;
  });

  afterAll(async () => {
    await app.close();
    await db.container.stop();
  });

  it('should login the admin', async () => {
    const mutation = `
    mutation Login($data: LoginInput!) {
      login(data: $data) {
        accessToken
        refreshToken
        user { email }
      }
    }
  `;

    const variables: { data: LoginInput } = {
      data: { email: 'admin@auth.com', password: 'Password12#' },
    };

    const res = await gql(mutation, variables);

    expect(res.body.data.login.user.email).toBe('admin@auth.com');
    accessToken = res.body.data.login.accessToken as string; // save token for next tests
  });

  it('should return current user from jwt query', async () => {
    const query = `query { jwt }`;
    const res = await gql(query, {}, accessToken);
    expect(res.body.data.jwt).toBe('Hello Admin Adminowski!');
  });
  //
  //
  it('should allow ADMIN role to access roleAdmin query', async () => {
    const query = `query { roleAdmin }`;
    const res = await gql(query, {}, accessToken);

    expect(res.body.data.roleAdmin).toBe('Hello ADMIN!');
  });

  it('should prevent everyone beside USER role to access roleUser query', async () => {
    const query = `query { roleUser }`;
    const res = await gql(query, {}, accessToken);

    expect(res.body.data).toBe(null);
    expect(res.body.errors).not.toBe(null);
  });

  it('should login the teacher', async () => {
    const mutation = `
    mutation Login($data: LoginInput!) {
      login(data: $data) {
        accessToken
        refreshToken
        user { email }
      }
    }
  `;

    const variables: { data: LoginInput } = {
      data: { email: 'teacher@auth.com', password: 'Password12#' },
    };

    const res = await gql(mutation, variables);

    expect(res.body.data.login.user.email).toBe('teacher@auth.com');
    accessToken = res.body.data.login.accessToken as string; // save token for next tests
  });

  it('should prevent everyone beside USER role to access roleUser query', async () => {
    const query = `query { roleUser }`;
    const res = await gql(query, {}, accessToken);

    expect(res.body.data).toBe(null);
    expect(res.body.errors).not.toBe(null);
  });

  it('should allow TEACHER role to access roleTeacher query', async () => {
    const query = `query { roleTeacher }`;
    const res = await gql(query, {}, accessToken);

    expect(res.body.data.roleTeacher).toBe('Hello TEACHER!');
  });

  describe('signupUser', () => {
    let userResponse: any;

    beforeAll(async () => {
      const mutation = `
      mutation Signup($data: SignupInput!) {
        signup(data: $data) {
          accessToken
          refreshToken
          refreshTokenId
          user { role, firstName, lastName }
        }
      }
    `;
      const variables = {
        data: {
          email: 'user1@auth.com',
          firstName: 'user',
          lastName: 'signup',
          password: 'Password12#',
        },
      };
      const res = await gql(mutation, variables);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      userResponse = res.body.data.signup;
    });

    it('should capitalize first and last names', () => {
      expect(userResponse.user.firstName).toBe('User');
      expect(userResponse.user.lastName).toBe('Signup');
    });

    it('should assign the correct role', () => {
      expect(userResponse.user.role).toBe('USER');
    });

    it('should return access and refresh tokens', () => {
      expect(userResponse.accessToken).toBeDefined();
      expect(userResponse.refreshToken).toBeDefined();
      expect(userResponse.refreshTokenId).toBeDefined();
    });

    it('should refresh tokens', async () => {
      const mutation = `
        mutation Refresh($data: RefreshTokenInput!) {
          refreshToken(data: $data) {
            accessToken
            refreshToken
          }
        }
      `;
      const { refreshToken, refreshTokenId } = userResponse as RefreshTokenInput;
      const variables: { data: RefreshTokenInput } = { data: { refreshToken, refreshTokenId } };

      const res = await gql(mutation, variables);
      expect(res.body.data.refreshToken.accessToken).toBeDefined();
    });

    it('should throw error that token is already revoked', async () => {
      const mutation = `
        mutation Refresh($data: RefreshTokenInput!) {
          refreshToken(data: $data) {
            accessToken
            refreshToken
          }
        }
      `;
      const { refreshToken, refreshTokenId } = userResponse as RefreshTokenInput;
      const variables: { data: RefreshTokenInput } = { data: { refreshToken, refreshTokenId } };

      const res = await gql(mutation, variables);
      expect(res.body.errors[0].message).toBe('Refresh token already revoked');
    });
  });
});
