import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { CreateActivityInput } from 'src/activities/dto/create-activity.input';

@ValidatorConstraint({ name: 'StartBeforeEnd', async: false })
export class StartBeforeEnd implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as CreateActivityInput;
    if (!obj.startTime || !obj.endTime) return true;
    return new Date(obj.startTime) < new Date(obj.endTime);
  }

  defaultMessage() {
    return 'End time must be after start time';
  }
}

@ValidatorConstraint({ name: 'StartNotInPast', async: false })
export class StartNotInPast implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as CreateActivityInput;
    if (!obj.startTime) return true;
    return new Date(obj.startTime) > new Date();
  }

  defaultMessage() {
    return 'Start time cannot be in the past';
  }
}

@ValidatorConstraint({ name: 'MinLessThanMax', async: false })
export class MinLessThanMax implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as Partial<CreateActivityInput>;
    const { minPlayers, maxPlayers } = obj;

    // case 1: both undefined — valid (no update)
    if (minPlayers === undefined && maxPlayers === undefined) return true;

    // case 2: only one provided — invalid
    if (minPlayers === undefined || maxPlayers === undefined) return false;

    // case 3: both provided — check comparison
    return minPlayers < maxPlayers;
  }

  defaultMessage(args: ValidationArguments) {
    const obj = args.object as Partial<CreateActivityInput>;
    const { minPlayers, maxPlayers } = obj;

    if (minPlayers === undefined && maxPlayers === undefined) {
      return '';
    }
    if (minPlayers === undefined || maxPlayers === undefined) {
      return 'Both minPlayers and maxPlayers must be provided together';
    }
    return 'minPlayers must be less than maxPlayers';
  }
}

@ValidatorConstraint({ name: 'PriceRequiresPayment', async: false })
export class PriceRequiresPayment implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as CreateActivityInput;
    if (obj.price == null) return true;
    return obj.paymentRequired === true;
  }

  defaultMessage() {
    return 'If price is set, paymentRequired must be true';
  }
}
