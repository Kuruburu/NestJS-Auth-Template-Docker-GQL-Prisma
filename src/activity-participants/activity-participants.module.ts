import { Module } from '@nestjs/common';
import { ActivityParticipantsService } from './activity-participants.service';
import { ActivityParticipantsResolver } from './activity-participants.resolver';
import { UsersModule } from 'src/users/users.module';
import { ActivitiesModule } from 'src/activities/activities.module';

@Module({
  providers: [ActivityParticipantsResolver, ActivityParticipantsService],
  imports: [UsersModule, ActivitiesModule],
})
export class ActivityParticipantsModule {}
