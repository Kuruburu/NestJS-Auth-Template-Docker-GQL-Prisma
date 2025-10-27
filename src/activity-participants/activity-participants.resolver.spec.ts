import { Test, TestingModule } from '@nestjs/testing';
import { ActivityParticipantsResolver } from './activity-participants.resolver';
import { ActivityParticipantsService } from './activity-participants.service';

describe('ActivityParticipantsResolver', () => {
  let resolver: ActivityParticipantsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityParticipantsResolver, ActivityParticipantsService],
    }).compile();

    resolver = module.get<ActivityParticipantsResolver>(ActivityParticipantsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
