import { Sport } from 'src/sports/entities/sport.entity';
import { Field } from '../entities/field.entity';

// (Field & { sports: Sport[] }) | null
export type FieldWithSports = Field & { sports: Sport[] };
