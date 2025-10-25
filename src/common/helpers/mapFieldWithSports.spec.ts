import { Sport } from '@prisma/client';
import { FieldWithNestedSports, mapFieldWithSports } from './mapFieldWithSports';

describe('mapFieldWithSports', () => {
  const sportArray: Sport[] = [
    {
      id: 'sport-1',
      name: 'Football',
      description: 'Play a match with friends on turf or grass.',
      minPlayers: 10,
      maxPlayers: 22,
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'sport-2',
      name: 'Basketball',
      description: '5v5 classic streetball or indoor.',
      minPlayers: 6,
      maxPlayers: 10,
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'sport-3',
      name: 'Tennis',
      description: 'Singles or doubles court play.',
      minPlayers: 2,
      maxPlayers: 4,
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockField: FieldWithNestedSports = {
    id: 'field-1',
    name: 'Central Park Field',
    createdAt: new Date(),
    description: 'A nice park',
    imageUrl: null,
    placeId: '1',
    updatedAt: new Date(),
    sports: [{ sport: sportArray[0] }, { sport: sportArray[1] }, { sport: sportArray[2] }],
  };
  it('should flatten nested sports into a direct array', () => {
    const result = mapFieldWithSports(mockField);

    expect(result).toEqual({ ...mockField, sports: sportArray });
  });

  it('should handle empty sports array gracefully', () => {
    const result = mapFieldWithSports({ ...mockField, sports: [] });
    expect(result?.sports).toEqual([]);
  });
});
