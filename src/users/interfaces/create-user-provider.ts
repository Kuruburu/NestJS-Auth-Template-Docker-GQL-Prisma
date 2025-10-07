import { Provider } from '@prisma/client';

export interface CreateUserProvider {
  userId: number;
  provider: Provider;
  providerId: string;
}
