import { Module } from '@nestjs/common';
import { ActivityParticipantsService } from './activity-participants.service';
import { ActivityParticipantsResolver } from './activity-participants.resolver';

@Module({
  providers: [ActivityParticipantsResolver, ActivityParticipantsService],
})
export class ActivityParticipantsModule {}
