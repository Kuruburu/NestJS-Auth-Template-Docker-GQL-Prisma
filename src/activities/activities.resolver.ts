import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ActivitiesService } from './activities.service';
import { Activity } from './entities/activity.entity';
import { CreateActivityInput } from './dto/create-activity.input';
import { UpdateActivityInput } from './dto/update-activity.input';

@Resolver(() => Activity)
export class ActivitiesResolver {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Mutation(() => Activity)
  createActivity(@Args('createActivityInput') createActivityInput: CreateActivityInput) {
    return this.activitiesService.create(createActivityInput);
  }

  @Query(() => [Activity], { name: 'activities' })
  findAll() {
    return this.activitiesService.findAll();
  }

  @Query(() => Activity, { name: 'activity' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.activitiesService.findOneOrThrow(id);
  }

  @Mutation(() => Activity)
  updateActivity(@Args('updateActivityInput') updateActivityInput: UpdateActivityInput) {
    return this.activitiesService.update(updateActivityInput);
  }

  @Mutation(() => Activity)
  removeActivity(@Args('id', { type: () => String }) id: string) {
    return this.activitiesService.remove(id);
  }
}
