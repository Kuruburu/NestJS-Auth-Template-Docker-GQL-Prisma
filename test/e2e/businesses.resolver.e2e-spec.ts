/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { LoginInput } from 'src/auth/dto/login.input';
import { GqlE2EClient, setupE2eTestApp, TestDatabase } from '../test-db-container';
import { CreateBusinessInput } from 'src/businesses/dto/create-business.input';
import { UpdateBusinessInput } from 'src/businesses/dto/update-business.input';

describe('BusinessResolver (e2e)', () => {
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

  describe('Business CRUD', () => {
    let createdBusinessId: string;

    it('should find all businesses', async () => {
      const query = `
        query findAllBusinesses { businesses { id name } }
      `;
      const res = await gql(query, {}, accessToken);
      const businesses = res.body.data.businesses;
      expect(businesses).toBeDefined();
      expect(Array.isArray(businesses)).toBe(true);
    });

    describe('Create', () => {
      const incorrectVariables: CreateBusinessInput = {
        name: 'New Business',
        email: 'newBusiness@example.com',
        ownerId: 'someOwnerId',
      };
      const correctVariables: CreateBusinessInput = { ...incorrectVariables, ownerId: 'user-1' };

      const variablesWithWrongOwnerId = { data: incorrectVariables };
      const variables = { data: correctVariables };

      it('should fail to create a new business if ownerId does not exist', async () => {
        const mutation = `mutation CreateBusiness($data: CreateBusinessInput!) {
          createBusiness(createBusinessInput: $data) { id name email ownerId }
          }
        `;

        const res = await gql(mutation, variablesWithWrongOwnerId, accessToken);

        expect(res.body.data).toBeNull();
        expect(res.body.errors).not.toBeNull();
      });

      it('should create a new business', async () => {
        const mutation = `mutation CreateBusiness($data: CreateBusinessInput!) {
          createBusiness(createBusinessInput: $data) { id name email ownerId }
          }
        `;

        const res = await gql(mutation, variables, accessToken);

        const business = res.body.data.createBusiness;
        expect(business).toBeDefined();
        expect(business.name).toBe(incorrectVariables.name);
        createdBusinessId = business.id;
      });
    });

    it('should find one business by id', async () => {
      const query = `query FindBusiness($id: String!) {
          business(id: $id) { id name }
        }
      `;

      const res = await gql(query, { id: createdBusinessId }, accessToken);
      const business = res.body.data.business;
      expect(business).toBeDefined();
      expect(business.id).toBe(createdBusinessId);
      expect(business.name).toBe('New Business');
    });

    it('should update an existing business', async () => {
      const mutation = `
        mutation UpdateBusiness($data: UpdateBusinessInput!) {
          updateBusiness(updateBusinessInput: $data) { id name }
        }
      `;

      const variables: { data: UpdateBusinessInput } = {
        data: {
          id: createdBusinessId,
          name: 'Updated business',
        },
      };

      const res = await gql(mutation, variables, accessToken);
      const updated = res.body.data.updateBusiness;

      expect(updated.id).toBe(createdBusinessId);
      expect(updated.name).toBe(variables.data.name);
    });

    it('should remove a sport', async () => {
      const mutation = `
        mutation RemoveBusiness($id: String!) {
          removeBusiness(id: $id) {
            id
            name
          }
        }
      `;

      const res = await gql(mutation, { id: createdBusinessId }, accessToken);
      const deleted = res.body.data.removeBusiness;
      expect(deleted).toBeDefined();
      expect(deleted.id).toBe(createdBusinessId);
    });

    it('should not find a deleted sport', async () => {
      const query = `
        query FindBusiness($id: String!) {
          business(id: $id) {
            id
            name
          }
        }
      `;

      const res = await gql(query, { id: createdBusinessId }, accessToken);
      // depending on your resolver, this may throw or return null
      expect(res.body.data).toBeNull();
      expect(res.body.errors).not.toBeNull();
    });
  });
});
