import { registerEnumType } from '@nestjs/graphql';
import { Provider } from '@prisma/client';

registerEnumType(Provider, {
  name: 'Provider',
  description: 'Auth provider',
});

export { Provider };
