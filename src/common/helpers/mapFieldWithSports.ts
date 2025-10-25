import { Field, Sport } from '@prisma/client';

export type FieldWithNestedSports = Field & { sports?: { sport: Sport }[] };
/**
 * Flattens a Field object with nested sports relations
 * into a simpler shape where `sports` is a direct array of Sport.
 *
 * @example
 * Input:
 * {
 *   id: "f1",
 *   name: "Main Field",
 *   sports: [
 *     { sport: { id: "s1", name: "Football" } },
 *     { sport: { id: "s2", name: "Tennis" } }
 *   ]
 * }
 *
 * Output:
 * {
 *   id: "f1",
 *   name: "Main Field",
 *   sports: [
 *     { id: "s1", name: "Football" },
 *     { id: "s2", name: "Tennis" }
 *   ]
 * }
 */
export function mapFieldWithSports<T extends FieldWithNestedSports>(field: T): Omit<T, 'sports'> & { sports: Sport[] } {
  const sports = field.sports?.map((relation) => relation.sport) ?? [];
  return { ...field, sports };
}
