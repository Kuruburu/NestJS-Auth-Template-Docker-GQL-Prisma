import { Provider } from '@prisma/client';

export interface FindProvidedUser {
  email: string;
  provider: Provider;
  providerId: string;
}
