import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SportsService } from './sports.service';
import { CreateSportInput } from './dto/create-sport.input';
import { UpdateSportInput } from './dto/update-sport.input';
import { Sport } from './entities/sport.entity';

@Resolver(() => Sport)
export class SportsResolver {
  constructor(private readonly sportsService: SportsService) {}

  @Mutation(() => Sport)
  createSport(@Args('createSportInput') createSportInput: CreateSportInput) {
    return this.sportsService.create(createSportInput);
  }

  @Query(() => [Sport], { name: 'sports' })
  findAll() {
    return this.sportsService.findAll();
  }

  @Query(() => Sport, { name: 'sport' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.sportsService.findOne(id);
  }

  @Mutation(() => Sport)
  updateSport(@Args('updateSportInput') updateSportInput: UpdateSportInput) {
    return this.sportsService.update(updateSportInput);
  }

  @Mutation(() => Sport)
  removeSport(@Args('id', { type: () => String }) id: string) {
    return this.sportsService.remove(id);
  }
}
