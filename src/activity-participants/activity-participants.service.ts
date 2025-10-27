import { Injectable } from '@nestjs/common';
import { CreateActivityParticipantInput } from './dto/create-activity-participant.input';
import { UpdateActivityParticipantInput } from './dto/update-activity-participant.input';

@Injectable()
export class ActivityParticipantsService {
  create(createActivityParticipantInput: CreateActivityParticipantInput) {
    return 'This action adds a new activityParticipant';
  }

  findAll() {
    return `This action returns all activityParticipants`;
  }

  findOne(id: number) {
    return `This action returns a #${id} activityParticipant`;
  }

  update(id: number, updateActivityParticipantInput: UpdateActivityParticipantInput) {
    return `This action updates a #${id} activityParticipant`;
  }

  remove(id: number) {
    return `This action removes a #${id} activityParticipant`;
  }
}
