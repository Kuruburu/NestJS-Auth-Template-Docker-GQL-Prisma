import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ActivityParticipantsService } from './activity-participants.service';
import { ActivityParticipant } from './entities/activity-participant.entity';
import { CreateActivityParticipantInput } from './dto/create-activity-participant.input';
import { UpdateActivityParticipantInput } from './dto/update-activity-participant.input';

@Resolver(() => ActivityParticipant)
export class ActivityParticipantsResolver {
  constructor(private readonly activityParticipantsService: ActivityParticipantsService) {}

  @Mutation(() => ActivityParticipant)
  createActivityParticipant(@Args('createActivityParticipantInput') createActivityParticipantInput: CreateActivityParticipantInput) {
    return this.activityParticipantsService.create(createActivityParticipantInput);
  }

  @Query(() => [ActivityParticipant], { name: 'activityParticipants' })
  findAll() {
    return this.activityParticipantsService.findAll();
  }

  @Query(() => ActivityParticipant, { name: 'activityParticipant' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.activityParticipantsService.findOne(id);
  }

  @Mutation(() => ActivityParticipant)
  updateActivityParticipant(@Args('updateActivityParticipantInput') updateActivityParticipantInput: UpdateActivityParticipantInput) {
    return this.activityParticipantsService.update(updateActivityParticipantInput.id, updateActivityParticipantInput);
  }

  @Mutation(() => ActivityParticipant)
  removeActivityParticipant(@Args('id', { type: () => Int }) id: number) {
    return this.activityParticipantsService.remove(id);
  }
}
