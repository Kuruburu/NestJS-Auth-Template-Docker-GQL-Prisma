import type { Config } from './config.interface';

const config = (): Config => {
  const env = process.env as Record<string, string>;
  return {
    nest: {
      port: Number(env.PORT) || 3000,
    },
    cors: {
      enabled: true,
    },
    swagger: {
      enabled: true,
      title: 'NestJS Auth template',
      description: 'Auth template for GraphQL and REST api',
      version: '1.0',
      path: 'api',
      bearerAuth: {
        name: 'jwt',
        options: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token here. Example: Bearer <your-token>',
        },
      },
    },
    graphql: {
      playgroundEnabled: true,
      debug: false,
      schemaDestination: './src/schema.graphql',
      sortSchema: true,
    },
    security: {
      expiresIn: '5m',
      refreshIn: '7d',
      bcryptSaltOrRound: 10,
      refreshTokenExpirationInDays: 30,
      refreshTokenShortExpirationInHours: 8,
      jwtAccessSecret: env.JWT_ACCESS_SECRET,
    },
    OAuthConfig: {
      WEB: {
        clientId: env.CLIENT_ID,
        clientSecret: env.CLIENT_SECRET,
        authUri: 'https://accounts.google.com/o/oauth2/auth',
        tokenUri: 'https://oauth2.googleapis.com/token',
        AUTH_PROVIDER_X509_CERT_URL: 'https://www.googleapis.com/oauth2/v1/certs',
        callbackUrl: env.CALLBACK_URL,
      },
    },
  };
};

export default config;
