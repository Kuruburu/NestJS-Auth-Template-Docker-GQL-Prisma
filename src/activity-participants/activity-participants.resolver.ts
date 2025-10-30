import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { ActivityParticipantsService } from './activity-participants.service';
import { ActivityParticipant } from './entities/activity-participant.entity';
import { CreateActivityParticipantInput } from './dto/create-activity-participant.input';
import { UpdateActivityParticipantInput } from './dto/update-activity-participant.input';
import { FindManyActivityParticipantInput } from './dto/find-many-activity-participant.input';
import { UserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';
import { ActivitiesService } from 'src/activities/activities.service';
import { Activity } from 'src/activities/entities/activity.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';

@Resolver(() => ActivityParticipant)
export class ActivityParticipantsResolver {
  constructor(
    private readonly activityParticipantsService: ActivityParticipantsService,
    private readonly usersService: UsersService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  @Roles('ADMIN')
  @Mutation(() => ActivityParticipant)
  createActivityParticipant(
    @Args('createActivityParticipantInput') createActivityParticipantInput: CreateActivityParticipantInput,
  ) {
    return this.activityParticipantsService.create(createActivityParticipantInput);
  }

  @Mutation(() => ActivityParticipant)
  joinActivity(@Args('activityId', { type: () => String }) activityId: string, @CurrentUser() user: UserDto) {
    return this.activityParticipantsService.create({ activityId, userId: user.id });
  }

  @Query(() => [ActivityParticipant], { name: 'activityParticipants' })
  findAll() {
    return this.activityParticipantsService.findAll();
  }

  @Query(() => [ActivityParticipant], { name: 'searchActivityParticipants' })
  findMany(
    @Args('findManyActivityParticipantInput') findManyActivityParticipantInput: FindManyActivityParticipantInput,
  ) {
    return this.activityParticipantsService.findMany(findManyActivityParticipantInput);
  }

  @Query(() => ActivityParticipant, { name: 'activityParticipant' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.activityParticipantsService.findOneOrThrow(id);
  }

  @Mutation(() => ActivityParticipant)
  updateActivityParticipant(
    @Args('updateActivityParticipantInput') updateActivityParticipantInput: UpdateActivityParticipantInput,
  ) {
    return this.activityParticipantsService.update(updateActivityParticipantInput);
  }

  @Mutation(() => ActivityParticipant)
  removeActivityParticipant(@Args('id', { type: () => String }) id: string) {
    return this.activityParticipantsService.remove(id);
  }

  @ResolveField('user', () => UserDto)
  user(@Parent() participant: ActivityParticipant) {
    return this.usersService.findOne(participant.userId);
  }

  @ResolveField('activity', () => Activity)
  activity(@Parent() participant: ActivityParticipant) {
    return this.activitiesService.findOne(participant.activityId);
  }
}
