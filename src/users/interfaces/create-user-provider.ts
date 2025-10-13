import { Provider } from '@prisma/client';

export interface CreateUserProvider {
  userId: string;
  provider: Provider;
  providerId: string;
}
