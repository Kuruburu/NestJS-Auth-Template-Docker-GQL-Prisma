import { Role } from '@prisma/client';

export interface JwtPayloadDto {
  sub: string;
  role: Role;
}
