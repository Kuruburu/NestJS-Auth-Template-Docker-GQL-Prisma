/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication } from '@nestjs/common';
import { GqlE2EClient, setupE2eTestApp, TestDatabase } from '../test-db-container';
import { CreateActivityParticipantInput } from 'src/activity-participants/dto/create-activity-participant.input';
import { UpdateActivityParticipantInput } from 'src/activity-participants/dto/update-activity-participant.input';
import { FindManyActivityParticipantInput } from 'src/activity-participants/dto/find-many-activity-participant.input';
import { Role } from '@prisma/client';

describe('ActivityParticipantsResolver (e2e)', () => {
  let app: INestApplication;
  let gql: GqlE2EClient;
  let db: TestDatabase;
  let accessToken: string;

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

  // student@auth.com
  const login = (role: Role) => {
    const adminEmail = 'admin@auth.com';
    const teacherEmail = 'teacher@auth.com';
    const studentEmail = 'student@auth.com';
    const email = role === 'STUDENT' ? studentEmail : role === 'TEACHER' ? teacherEmail : adminEmail;
    const variables = {
      data: { email, password: 'Password12#' },
    };
    it('should login the user', async () => {
      const mutation = `
      mutation Login($data: LoginInput!) {
        login(data: $data) {
          accessToken
          user { email }
        }
      }
    `;

      const res = await gql(mutation, variables);
      expect(res.body.data.login.user.email).toBe(email);
      accessToken = res.body.data.login.accessToken as string;
    });
  };
  login('ADMIN');

  describe('ActivityParticipants CRUD', () => {
    let createdParticipantId: string;

    it('should find all participants', async () => {
      const query = `
        query FindAllParticipants {
          activityParticipants { id activityId userId joinedAt }
        }
      `;

      const res = await gql(query, {}, accessToken);
      const participants = res.body.data.activityParticipants;
      expect(participants).toBeDefined();
      expect(Array.isArray(participants)).toBe(true);
    });

    describe('Create', () => {
      const correctInput: CreateActivityParticipantInput = {
        activityId: 'activity-1',
        userId: 'user-3',
      };

      const incorrectInput: CreateActivityParticipantInput = {
        activityId: 'non-existent-activity',
        userId: 'user-1',
      };

      const incorrectInput2: CreateActivityParticipantInput = {
        activityId: 'activity-1',
        userId: 'user-1',
      };

      const mutation = `
          mutation CreateParticipant($data: CreateActivityParticipantInput!) {
            createActivityParticipant(createActivityParticipantInput: $data) {
              id activityId userId
            }
          }
        `;

      it('should fail to create participant if activityId does not exist', async () => {
        const res = await gql(mutation, { data: incorrectInput }, accessToken);

        expect(res.body.data).toBeNull();
        expect(res.body.errors).not.toBeNull();
      });

      it('should fail to create participant if he already participates', async () => {
        const res = await gql(mutation, { data: incorrectInput2 }, accessToken);

        expect(res.body.data).toBeNull();
        expect(res.body.errors).not.toBeNull();
      });

      it('should create a participant successfully', async () => {
        const res = await gql(mutation, { data: correctInput }, accessToken);

        const participant = res.body.data.createActivityParticipant;
        expect(participant).toBeDefined();
        expect(participant.activityId).toBe(correctInput.activityId);
        expect(participant.userId).toBe(correctInput.userId);
        createdParticipantId = participant.id;
      });

      login('STUDENT');

      it('should create a participant successfully when joinActivity', async () => {
        const mutation = `
          mutation CreateParticipant($id: String!) {
            joinActivity(activityId: $id) {
              id activityId userId
            }
          }
        `;
        const res = await gql(mutation, { id: 'activity-5' }, accessToken);

        const participant = res.body.data.joinActivity;
        expect(participant).toBeDefined();
        expect(participant.activityId).toBe('activity-5');
        expect(participant.userId).toBe('user-3');
      });
    });

    it('should find one participant by id', async () => {
      const query = `
        query FindParticipant($id: String!) {
          activityParticipant(id: $id) {
            id activityId userId joinedAt
          }
        }
      `;

      const res = await gql(query, { id: createdParticipantId }, accessToken);
      const participant = res.body.data.activityParticipant;
      expect(participant).toBeDefined();
      expect(participant.id).toBe(createdParticipantId);
    });

    it('should update an existing participant', async () => {
      const mutation = `
        mutation UpdateParticipant($data: UpdateActivityParticipantInput!) {
          updateActivityParticipant(updateActivityParticipantInput: $data) {
            id activityId userId joinedAt
          }
        }
      `;

      const variables: { data: UpdateActivityParticipantInput } = {
        data: {
          id: createdParticipantId,
          userId: 'user-3', // update userId for testing
        },
      };

      const res = await gql(mutation, variables, accessToken);
      console.log(res.body);
      const updated = res.body.data.updateActivityParticipant;

      expect(updated.id).toBe(createdParticipantId);
      expect(updated.userId).toBe(variables.data.userId);
    });

    it('should find many participants by activityId or userId', async () => {
      const query = `
        query FindManyParticipants($data: FindManyActivityParticipantInput!) {
          searchActivityParticipants(findManyActivityParticipantInput: $data) {
            id activityId userId
          }
        }
      `;

      const variables: { data: FindManyActivityParticipantInput } = {
        data: { activityId: 'activity-1', userId: 'user-2' },
      };

      const res = await gql(query, variables, accessToken);
      const participants = res.body.data.searchActivityParticipants;

      expect(participants).toBeDefined();
      expect(Array.isArray(participants)).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      expect(participants.some((p) => p.id === createdParticipantId)).toBe(true);
    });

    it('should remove a participant', async () => {
      const mutation = `
        mutation RemoveParticipant($id: String!) {
          removeActivityParticipant(id: $id) { id activityId userId }
        }
      `;

      const res = await gql(mutation, { id: createdParticipantId }, accessToken);
      const deleted = res.body.data.removeActivityParticipant;
      expect(deleted).toBeDefined();
      expect(deleted.id).toBe(createdParticipantId);
    });

    it('should not find a deleted participant', async () => {
      const query = `
        query FindParticipant($id: String!) {
          activityParticipant(id: $id) {
            id activityId userId
          }
        }
      `;

      const res = await gql(query, { id: createdParticipantId }, accessToken);
      expect(res.body.data).toBeNull();
      expect(res.body.errors).not.toBeNull();
    });
  });
});
