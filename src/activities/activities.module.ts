import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesResolver } from './activities.resolver';

@Module({
  providers: [ActivitiesResolver, ActivitiesService],
})
export class ActivitiesModule {}
