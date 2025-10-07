import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UpdateUserInput } from './dto/update-user.input';
import { UserDto } from './dto/user.dto';

@Resolver(() => UserDto)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserDto], { name: 'users' })
  async findAll() {
    return await this.usersService.findAll();
  }

  @Query(() => UserDto, { name: 'user' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return await this.usersService.findOne(id);
  }

  @Mutation(() => UserDto)
  async update(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return await this.usersService.update(updateUserInput);
  }

  @Mutation(() => UserDto)
  async remove(@Args('id', { type: () => Int }) id: number) {
    return await this.usersService.remove(id);
  }
}
