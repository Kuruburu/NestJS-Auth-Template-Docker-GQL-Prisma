/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { LoginInput } from 'src/auth/dto/login.input';
import { GqlE2EClient, setupE2eTestApp, TestDatabase } from '../test-db-container';
import { CreateActivityInput } from 'src/activities/dto/create-activity.input';
import { UpdateActivityInput } from 'src/activities/dto/update-activity.input';

describe('ActivitiesResolver (e2e)', () => {
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

  describe('Activities CRUD', () => {
    let createdActivityId: string;

    it('should find all activities', async () => {
      const query = `
        query findAllActivities {
          activities {
            id fieldId sportId startTime endTime paymentRequired price minPlayers maxPlayers
          }
        }
      `;
      const res = await gql(query, {}, accessToken);
      const activities = res.body.data.activities;
      expect(activities).toBeDefined();
      expect(Array.isArray(activities)).toBe(true);
    });

    describe('create', () => {
      const mutation = `
        mutation CreateActivity($data: CreateActivityInput!) {
          createActivity(createActivityInput: $data) {
            id fieldId sportId startTime endTime paymentRequired price minPlayers maxPlayers
          }
        }
      `;
      const now = new Date();

      // Yesterday
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      // Tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);

      const tomorrowTwoHoursLater = new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000);
      const yesterdayTwoHoursLater = new Date(tomorrow.getTime() - 2 * 60 * 60 * 1000);

      const correctVariables: CreateActivityInput = {
        fieldId: 'place-1-field-1',
        sportId: 'sport-1',
        startTime: tomorrow,
        endTime: tomorrowTwoHoursLater,
        minPlayers: 1,
        maxPlayers: 2,
      };

      it('should create a new activity', async () => {
        const res = await gql(mutation, { data: correctVariables }, accessToken);

        const activity = res.body.data.createActivity;
        expect(activity).toBeDefined();
        expect(activity.sportId).toBe('sport-1');
        expect(activity.fieldId).toBe('place-1-field-1');
        createdActivityId = activity.id;
      });

      it('should not create a new activity when fieldId is incorrect', async () => {
        const incorrectInput: CreateActivityInput = {
          ...correctVariables,
          fieldId: 'incorrectId',
        };
        const res = await gql(mutation, { data: incorrectInput }, accessToken);

        expect(res.body.errors).not.toBeNull();
        expect(res.body.data).toBe(null);
      });

      it('should not create a new activity when sportId is incorrect', async () => {
        const incorrectInput: CreateActivityInput = {
          ...correctVariables,
          sportId: 'incorrectId',
        };
        const res = await gql(mutation, { data: incorrectInput }, accessToken);

        expect(res.body.errors).not.toBeNull();
        expect(res.body.data).toBe(null);
      });

      it('should not create a new activity when maxPlayers < minPlayers', async () => {
        const incorrectInput: CreateActivityInput = {
          ...correctVariables,
          maxPlayers: 4,
          minPlayers: 5,
        };
        const res = await gql(mutation, { data: incorrectInput }, accessToken);

        expect(res.body.errors).not.toBeNull();
        expect(res.body.data).toBe(null);
      });

      it('should not create a new activity when payment is not required and price is set', async () => {
        const incorrectInput: CreateActivityInput = {
          ...correctVariables,
          minPlayers: 5,
          paymentRequired: false,
          price: 50,
        };
        const res = await gql(mutation, { data: incorrectInput }, accessToken);

        expect(res.body.errors).not.toBeNull();
        expect(res.body.data).toBe(null);
      });

      it('should not create a new activity when date is past', async () => {
        const incorrectInput: CreateActivityInput = {
          ...correctVariables,
          startTime: yesterday,
          endTime: yesterdayTwoHoursLater,
        };

        const res = await gql(mutation, { data: incorrectInput }, accessToken);

        expect(res.body.errors).not.toBeNull();
        expect(res.body.data).toBe(null);
      });
    });
    //
    it('should find one activity by id', async () => {
      const query = `
        query FindActivity($id: String!) {
          activity(id: $id) {
            id fieldId sportId startTime endTime paymentRequired price minPlayers maxPlayers
          }
        }
      `;

      const res = await gql(query, { id: createdActivityId }, accessToken);
      const activity = res.body.data.activity;
      expect(activity).toBeDefined();
      expect(activity.fieldId).toBe('place-1-field-1');
    });

    describe('update', () => {
      const mutation = `
        mutation UpdateActivity($data: UpdateActivityInput!) {
          updateActivity(updateActivityInput: $data) {
            id fieldId sportId startTime endTime paymentRequired price minPlayers maxPlayers
          }
        }
      `;

      it('should update an existing activity', async () => {
        const correctInput: UpdateActivityInput = {
          id: createdActivityId,
          minPlayers: 5,
          maxPlayers: 10,
        };
        const res = await gql(mutation, { data: correctInput }, accessToken);
        const updated = res.body.data.updateActivity;

        expect(updated).toBeDefined();
        expect(updated.minPlayers).toBe(5);
        expect(updated.id).toBe(createdActivityId);
      });

      it('should not updated activity if minPlayers is greater than maxPlayers', async () => {
        const incorrectInput: UpdateActivityInput = {
          id: createdActivityId,
          minPlayers: 5,
          maxPlayers: 4,
        };
        const res = await gql(mutation, { data: incorrectInput }, accessToken);

        expect(res.body.data).toBeNull();
        expect(res.body.errors).not.toBeNull();
      });

      it('should not updated activity if minPlayers is greater than maxPlayers', async () => {
        const incorrectInput: UpdateActivityInput = {
          id: createdActivityId,
          maxPlayers: 4,
        };
        const res = await gql(mutation, { data: incorrectInput }, accessToken);

        expect(res.body.data).toBeNull();
        expect(res.body.errors).not.toBeNull();
      });
    });

    it('should remove a activity', async () => {
      const mutation = `
        mutation RemoveActivity($id: String!) {
          removeActivity(id: $id) {
            id fieldId sportId startTime endTime paymentRequired price minPlayers maxPlayers
          }
        }
      `;

      const res = await gql(mutation, { id: createdActivityId }, accessToken);
      const deleted = res.body.data.removeActivity;
      expect(deleted).toBeDefined();
      expect(deleted.id).toBe(createdActivityId);
    });

    it('should not find a deleted activity', async () => {
      const query = `
        query FindActivity($id: String!) {
          activity(id: $id) {
            id fieldId sportId startTime endTime paymentRequired price minPlayers maxPlayers
          }
        }
      `;

      const res = await gql(query, { id: createdActivityId }, accessToken);
      // depending on your resolver, this may throw or return null
      expect(res.body.data).toBeNull();
      expect(res.body.errors).not.toBeNull();
    });
  });
});
