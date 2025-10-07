import { Role } from '@prisma/client';

export interface JwtPayloadDto {
  sub: number;
  role: Role;
}
