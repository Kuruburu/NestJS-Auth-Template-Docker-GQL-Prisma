import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
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
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.activitiesService.findOne(id);
  }

  @Mutation(() => Activity)
  updateActivity(@Args('updateActivityInput') updateActivityInput: UpdateActivityInput) {
    return this.activitiesService.update(updateActivityInput.id, updateActivityInput);
  }

  @Mutation(() => Activity)
  removeActivity(@Args('id', { type: () => Int }) id: number) {
    return this.activitiesService.remove(id);
  }
}
