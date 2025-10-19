import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { BusinessesService } from './businesses.service';
import { Business } from './entities/business.entity';
import { CreateBusinessInput } from './dto/create-business.input';
import { UpdateBusinessInput } from './dto/update-business.input';

@Resolver(() => Business)
export class BusinessesResolver {
  constructor(private readonly businessesService: BusinessesService) {}

  @Mutation(() => Business)
  createBusiness(@Args('createBusinessInput') createBusinessInput: CreateBusinessInput) {
    return this.businessesService.create(createBusinessInput);
  }

  @Query(() => [Business], { name: 'businesses' })
  findAll() {
    return this.businessesService.findAll();
  }

  @Query(() => Business, { name: 'business' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.businessesService.findOneOrThrow(id);
  }

  @Mutation(() => Business)
  updateBusiness(@Args('updateBusinessInput') updateBusinessInput: UpdateBusinessInput) {
    return this.businessesService.update(updateBusinessInput);
  }

  @Mutation(() => Business)
  removeBusiness(@Args('id', { type: () => String }) id: string) {
    return this.businessesService.remove(id);
  }
}
