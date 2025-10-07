import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface Config {
  nest: NestConfig;
  cors: CorsConfig;
  swagger: SwaggerConfig;
  graphql: GraphqlConfig;
  security: SecurityConfig;
  OAuthConfig: OAuthConfig;
}

export interface NestConfig {
  port: number;
}

export interface CorsConfig {
  enabled: boolean;
}

export interface SwaggerConfig {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
  bearerAuth: {
    options: SecuritySchemeObject;
    name: string;
  };
}

export interface GraphqlConfig {
  playgroundEnabled: boolean;
  debug: boolean;
  schemaDestination: string;
  sortSchema: boolean;
}

export interface SecurityConfig {
  expiresIn: string;
  refreshIn: string;
  bcryptSaltOrRound: string | number;
  refreshTokenExpirationInDays: number;
  refreshTokenShortExpirationInHours: number;
  jwtAccessSecret: string;
}
export interface OAuthConfig {
  WEB: {
    clientId: string;
    authUri: string;
    tokenUri: string;
    AUTH_PROVIDER_X509_CERT_URL: string;
    clientSecret: string;
    callbackUrl: string;
  };
}
