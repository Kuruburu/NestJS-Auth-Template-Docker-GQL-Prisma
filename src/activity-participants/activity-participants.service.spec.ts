import { Test, TestingModule } from '@nestjs/testing';
import { ActivityParticipantsService } from './activity-participants.service';

describe('ActivityParticipantsService', () => {
  let service: ActivityParticipantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityParticipantsService],
    }).compile();

    service = module.get<ActivityParticipantsService>(ActivityParticipantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
