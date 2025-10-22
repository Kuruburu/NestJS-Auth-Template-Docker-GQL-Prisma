/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { LoginInput } from 'src/auth/dto/login.input';
import { GqlE2EClient, setupE2eTestApp, TestDatabase } from '../test-db-container';
import { CreatePlaceInput } from 'src/places/dto/create-place.input';
import { UpdatePlaceInput } from 'src/places/dto/update-place.input';

const wrongCreateInput: { data: CreatePlaceInput } = {
  data: {
    name: 'new-place',
    ownerId: 'new-place-owner-1',
    city: 'new-city',
    address: 'new-address',
    latitude: 69,
    longitude: 69,
    businessId: 'new-business-id',
    description: 'new-description',
  },
};

const createInput: { data: CreatePlaceInput } = {
  data: {
    name: 'new-place',
    ownerId: 'user-1',
    city: 'new-city',
    address: 'new-address',
    latitude: 69,
    longitude: 69,
    businessId: 'business-1',
    description: 'new-description',
  },
};

const loginInput: { data: LoginInput } = {
  data: { email: 'admin@auth.com', password: 'Password12#' },
};

describe('PlacesResolver (e2e)', () => {
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

    const res = await gql(mutation, loginInput);
    expect(res.body.data.login.user.email).toBe('admin@auth.com');
    accessToken = res.body.data.login.accessToken as string;
  });

  describe('Places CRUD', () => {
    let createdPlaceId: string;

    it('should find all places', async () => {
      const query = `
        query findAllPlaces {
          places {
            id
            name
          }
        }
      `;
      const res = await gql(query, {}, accessToken);
      const places = res.body.data.places;
      expect(places).toBeDefined();
      expect(Array.isArray(places)).toBe(true);
    });

    describe('Create', () => {
      const mutation = `
        mutation CreatePlace($data: CreatePlaceInput!) {
          createPlace(createPlaceInput: $data) { id name }
        }
      `;
      it('should throw error when business or owner is not found', async () => {
        const res = await gql(mutation, wrongCreateInput, accessToken);
        expect(res.body.data).toBeNull();
        expect(Array.isArray(res.body.errors)).toBe(true);
      });

      it('should create a new place', async () => {
        const res = await gql(mutation, createInput, accessToken);

        console.log('createPlace', res.body);
        const place = res.body.data.createPlace;
        expect(place).toBeDefined();
        expect(place.name).toBe('new-place');
        createdPlaceId = place.id;
      });
    });
    it('should find one place by id', async () => {
      const query = `
        query FindPlace($id: String!) {
          place(id: $id) { id name }
        }
      `;

      const res = await gql(query, { id: createdPlaceId }, accessToken);
      const place = res.body.data.place;
      expect(place).toBeDefined();
      expect(place.id).toBe(createdPlaceId);
      expect(place.name).toBe('new-place');
    });

    it('should update an existing place', async () => {
      const mutation = `
        mutation UpdatePlace($data: UpdatePlaceInput!) {
          updatePlace(updatePlaceInput: $data) {
            id
            name
            description
          }
        }
      `;

      const updateInput: { data: UpdatePlaceInput } = { data: { id: createdPlaceId, name: 'Updated place' } };

      const res = await gql(mutation, updateInput, accessToken);
      const updated = res.body.data.updatePlace;
      console.log('update body', res.body);

      expect(updated.id).toBe(createdPlaceId);
      expect(updated.name).toBe(updateInput.data.name);
    });

    it('should remove a place', async () => {
      const mutation = `
        mutation RemovePlace($id: String!) {
          removePlace(id: $id) { id name }
        }
      `;

      const res = await gql(mutation, { id: createdPlaceId }, accessToken);
      const deleted = res.body.data.removePlace;
      expect(deleted).toBeDefined();
      expect(deleted.id).toBe(createdPlaceId);
    });

    it('should not find a deleted place', async () => {
      const query = `
        query FindPlace($id: String!) {
          place(id: $id) { id name }
        }
      `;

      const res = await gql(query, { id: createdPlaceId }, accessToken);
      // depending on your resolver, this may throw or return null
      console.log(res.body.data);
      expect(res.body.data).toBeNull();
      expect(res.body.errors).not.toBeNull();
    });
  });
});
