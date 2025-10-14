/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { LoginInput } from 'src/auth/dto/login.input';
import { GqlE2EClient, setupE2eTestApp, TestDatabase } from '../test-db-container';

describe('SportsResolver (e2e)', () => {
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
    accessToken = res.body.data.login.accessToken as string;
  });

  describe('Sports CRUD', () => {
    let createdSportId: string;

    it('should find all sports', async () => {
      const query = `
        query findAllSports {
          sports {
            id
            name
          }
        }
      `;
      const res = await gql(query, {}, accessToken);
      const sports = res.body.data.sports;
      expect(sports).toBeDefined();
      expect(Array.isArray(sports)).toBe(true);
    });

    it('should create a new sport', async () => {
      const mutation = `
        mutation CreateSport($data: CreateSportInput!) {
          createSport(createSportInput: $data) {
            id
            name
            minPlayers
            maxPlayers
          }
        }
      `;

      const variables = {
        data: {
          name: 'Padel',
          description: 'A mix of tennis and squash',
          minPlayers: 2,
          maxPlayers: 4,
        },
      };

      const res = await gql(mutation, variables, accessToken);

      const sport = res.body.data.createSport;
      expect(sport).toBeDefined();
      expect(sport.name).toBe('Padel');
      createdSportId = sport.id;
    });

    it('should find one sport by id', async () => {
      const query = `
        query FindSport($id: String!) {
          sport(id: $id) {
            id
            name
          }
        }
      `;

      const res = await gql(query, { id: createdSportId }, accessToken);
      const sport = res.body.data.sport;
      expect(sport).toBeDefined();
      expect(sport.id).toBe(createdSportId);
      expect(sport.name).toBe('Padel');
    });

    it('should update an existing sport', async () => {
      const mutation = `
        mutation UpdateSport($data: UpdateSportInput!) {
          updateSport(updateSportInput: $data) {
            id
            name
            description
          }
        }
      `;

      const variables = {
        data: {
          id: createdSportId,
          name: 'Updated Padel',
          description: 'Now with advanced court design',
        },
      };

      const res = await gql(mutation, variables, accessToken);
      const updated = res.body.data.updateSport;

      expect(updated.id).toBe(createdSportId);
      expect(updated.name).toBe('Updated Padel');
      expect(updated.description).toBe('Now with advanced court design');
    });

    it('should remove a sport', async () => {
      const mutation = `
        mutation RemoveSport($id: String!) {
          removeSport(id: $id) {
            id
            name
          }
        }
      `;

      const res = await gql(mutation, { id: createdSportId }, accessToken);
      const deleted = res.body.data.removeSport;
      expect(deleted).toBeDefined();
      expect(deleted.id).toBe(createdSportId);
    });

    it('should not find a deleted sport', async () => {
      const query = `
        query FindSport($id: String!) {
          sport(id: $id) {
            id
            name
          }
        }
      `;

      const res = await gql(query, { id: createdSportId }, accessToken);
      // depending on your resolver, this may throw or return null
      console.log(res.body.data);
      expect(res.body.data).toBeNull();
      expect(res.body.errors).not.toBeNull();
    });
  });
});
