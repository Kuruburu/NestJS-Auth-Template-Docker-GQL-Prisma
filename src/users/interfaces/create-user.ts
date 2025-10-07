import { Provider, Role } from '@prisma/client';

export interface CreateUser {
  firstName: string;
  lastName: string;
  role: Role;
  email: string;
  password: string;
  providerId: string;
  provider: Provider;
}
