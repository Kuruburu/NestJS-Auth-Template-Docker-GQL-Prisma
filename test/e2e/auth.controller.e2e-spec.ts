/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import * as request from 'supertest';
import { LoginInput } from 'src/auth/dto/login.input';
import { RefreshTokenInput } from 'src/auth/dto/refresh-token.input';
import { setupE2eTestApp, TestDatabase } from '../test-db-container';
import { SignupInput } from 'src/auth/dto/signup.input';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let db: TestDatabase;
  let httpServer: App;

  beforeAll(async () => {
    const result = await setupE2eTestApp();
    app = result.app;
    db = result.db;
    httpServer = result.httpServer;
  });

  afterAll(async () => {
    await app.close();
    await db.container.stop();
  });

  it('should login the admin', async () => {
    const variables: LoginInput = {
      email: 'admin@auth.com',
      password: 'Password12#',
    };

    // const res = await gql(mutation, variables);
    const res = await request(httpServer).post('/auth/login').send(variables).expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('refreshTokenId');

    expect(res.body.user.email).toBe('admin@auth.com');
    accessToken = res.body.accessToken as string; // save token for next tests
  });

  it('should return current user from jwt query', async () => {
    const res = await request(httpServer).get('/auth/test/jwt').set('Authorization', `Bearer ${accessToken}`);

    expect(res.text).toBe('Hello Admin Adminowski!');
  });
  it('should allow ADMIN role to access roleAdmin query', async () => {
    const res = await request(httpServer).get('/auth/test/admin').set('Authorization', `Bearer ${accessToken}`);
    expect(res.text).toBe('Hello ADMIN!');
  });
  //
  it('should prevent everyone beside USER role to access roleUser query', async () => {
    const res = await request(httpServer).get('/auth/test/user').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toEqual(403);
  });
  //
  it('should login the teacher', async () => {
    const variables: LoginInput = { email: 'teacher@auth.com', password: 'Password12#' };

    const res = await request(httpServer).post('/auth/login').send(variables).expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('refreshTokenId');

    expect(res.body.user.email).toBe('teacher@auth.com');
    accessToken = res.body.accessToken as string; // save token for next tests
  });
  //
  it('should prevent everyone beside USER role to access roleUser query', async () => {
    const res = await request(httpServer).get('/auth/test/user').set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toEqual(403);
  });
  //
  it('should allow TEACHER role to access roleTeacher query', async () => {
    const res = await request(httpServer).get('/auth/test/teacher').set('Authorization', `Bearer ${accessToken}`);

    expect(res.text).toBe('Hello TEACHER!');
  });
  //
  describe('signupUser', () => {
    let userResponse: any;

    beforeAll(async () => {
      const variables: SignupInput = {
        email: 'user1@auth.com',
        firstName: 'user',
        lastName: 'signup',
        password: 'Password12#',
      };

      const res = await request(httpServer).post('/auth/signup').send(variables);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      userResponse = res.body;
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
      const { refreshToken, refreshTokenId } = userResponse as RefreshTokenInput;
      const variables: RefreshTokenInput = { refreshToken, refreshTokenId };

      const res = await request(httpServer)
        .post('/auth/refresh-token')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(variables);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshTokenId).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();

      expect(res.body.accessToken).not.toEqual(accessToken);
      expect(res.body.refreshTokenId).not.toEqual(refreshTokenId);
      expect(res.body.refreshToken).not.toEqual(refreshToken);
    });

    it('should throw error that token is already revoked', async () => {
      const { refreshToken, refreshTokenId } = userResponse as RefreshTokenInput;
      const variables: RefreshTokenInput = { refreshToken, refreshTokenId };

      const res = await request(httpServer)
        .post('/auth/refresh-token')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(variables);

      expect(res.body.message).toBe('Refresh token already revoked');
      expect(res.status).toBe(403);
    });
  });
});
