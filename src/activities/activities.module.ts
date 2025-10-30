import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesResolver } from './activities.resolver';

@Module({
  providers: [ActivitiesResolver, ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
