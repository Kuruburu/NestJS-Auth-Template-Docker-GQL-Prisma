import { InputType, Int, Field } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import {
  IsInt,
  Min,
  Max,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

@ValidatorConstraint({ name: 'MaxPlayersGreaterThanMin', async: false })
class MaxPlayersGreaterThanMin implements ValidatorConstraintInterface {
  validate(maxPlayers: number, args: ValidationArguments) {
    const { object } = args;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const minPlayers = (object as any).minPlayers;
    return typeof minPlayers === 'number' && maxPlayers >= minPlayers;
  }

  defaultMessage() {
    return `maxPlayers must be greater than or equal to minPlayers`;
  }
}
@InputType()
export class CreateSportInput implements Prisma.SportCreateInput {
  @IsString()
  @Length(2, 50)
  @Field(() => String)
  name: string;

  @IsString()
  @Length(2, 300)
  @Field(() => String, { nullable: true })
  description?: string | null;

  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(50)
  @Field(() => Int)
  minPlayers: number;

  @IsInt()
  @IsPositive()
  @Min(2)
  @Max(999)
  @Validate(MaxPlayersGreaterThanMin)
  @Field(() => Int, { nullable: true })
  maxPlayers?: number;

  @Field(() => String, { nullable: true })
  imageUrl?: string;
}
