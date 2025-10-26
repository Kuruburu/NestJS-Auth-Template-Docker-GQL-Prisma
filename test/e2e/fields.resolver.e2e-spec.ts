/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { LoginInput } from 'src/auth/dto/login.input';
import { GqlE2EClient, setupE2eTestApp, TestDatabase } from '../test-db-container';
import { CreateFieldInput } from 'src/fields/dto/create-field.input';
import { UpdateFieldInput } from 'src/fields/dto/update-field.input';

describe('FieldsResolver (e2e)', () => {
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

  describe('Fields CRUD', () => {
    let createdFieldId: string;

    it('should find all fields', async () => {
      const query = `
        query findAllFields {
          fields {
            id
            name
            sports {
              id
              name
            }
          }
        }
      `;
      const res = await gql(query, {}, accessToken);
      const fields = res.body.data.fields;
      expect(fields).toBeDefined();
      expect(Array.isArray(fields)).toBe(true);
      expect(Array.isArray(fields[0].sports)).toBe(true);
      expect(Array.isArray(fields[0].sports)).toBe(true);
      expect(fields[0].sports[0].name).toBeDefined();
    });

    it('should create a new field', async () => {
      const mutation = `
        mutation CreateField($data: CreateFieldInput!) {
          createField(createFieldInput: $data) {
            id
            name
            sports {
              id
              name
            }
          }
        }
      `;

      const variables: { data: CreateFieldInput } = {
        data: {
          name: 'Orlik',
          description: 'Nice playfield',
          placeId: 'place-1',
          sportsIds: ['sport-1', 'sport-2'],
        },
      };

      const res = await gql(mutation, variables, accessToken);

      const field = res.body.data.createField;
      expect(field).toBeDefined();
      expect(Array.isArray(field.sports)).toBe(true);
      expect(field.sports[0].id).toBe('sport-2');
      expect(field.sports[1].id).toBe('sport-1');
      createdFieldId = field.id;
    });

    it('should not create a new field when sportId is incorrect', async () => {
      const mutation = `
        mutation CreateField($data: CreateFieldInput!) {
          createField(createFieldInput: $data) {
            id
            name
          }
        }
      `;

      const variables: { data: CreateFieldInput } = {
        data: {
          name: 'Orlik',
          description: 'nice playfield',
          placeId: 'place-1',
          sportsIds: ['sport-1', 'wrong-sport-id'],
        },
      };

      const res = await gql(mutation, variables, accessToken);

      expect(res.body.errors).not.toBeNull();
      expect(res.body.data).toBe(null);
    });

    it('should find one field by id', async () => {
      const query = `
        query FindField($id: String!) {
          field(id: $id) {
            id
            name
            sports {
              id
              name
            }

          }
        }
      `;

      const res = await gql(query, { id: createdFieldId }, accessToken);
      const field = res.body.data.field;
      expect(field).toBeDefined();
      expect(Array.isArray(field.sports)).toBe(true);
      expect(field.sports[0].id).toBe('sport-2');
    });

    it('should update an existing field', async () => {
      const mutation = `
        mutation UpdateField($data: UpdateFieldInput!) {
          updateField(updateFieldInput: $data) {
            id
            name
            description
            sports {
              id
              name
            }
          }
        }
      `;

      const variables: { data: UpdateFieldInput } = {
        data: {
          id: createdFieldId,
          name: 'Updated Padel',
          description: 'Now with advanced court design',
        },
      };

      const res = await gql(mutation, variables, accessToken);
      const updated = res.body.data.updateField;

      expect(updated).toBeDefined();
      expect(Array.isArray(updated.sports)).toBe(true);
      expect(updated.sports[0].id).toBe('sport-2');
      expect(updated.id).toBe(createdFieldId);
      expect(updated.name).toBe('Updated Padel');
      expect(updated.description).toBe('Now with advanced court design');
    });

    it('should remove a field', async () => {
      const mutation = `
        mutation RemoveField($id: String!) {
          removeField(id: $id) {
            id
            name
          }
        }
      `;

      const res = await gql(mutation, { id: createdFieldId }, accessToken);
      const deleted = res.body.data.removeField;
      expect(deleted).toBeDefined();
      expect(deleted.id).toBe(createdFieldId);
    });

    it('should not find a deleted field', async () => {
      const query = `
        query FindField($id: String!) {
          field(id: $id) {
            id
            name
          }
        }
      `;

      const res = await gql(query, { id: createdFieldId }, accessToken);
      // depending on your resolver, this may throw or return null
      expect(res.body.data).toBeNull();
      expect(res.body.errors).not.toBeNull();
    });
  });
});
