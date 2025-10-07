import { GraphqlConfig } from './common/configs/config.interface';
import { ConfigService } from '@nestjs/config';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory } from '@nestjs/graphql';

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  // eslint-disable-next-line prettier/prettier
  constructor(private configService: ConfigService) { }
  createGqlOptions(): ApolloDriverConfig {
    const graphqlConfig = this.configService.get<GraphqlConfig>('graphql');
    return {
      // schema options
      autoSchemaFile: (graphqlConfig && graphqlConfig.schemaDestination) || './src/schema.graphql',
      sortSchema: graphqlConfig && graphqlConfig.sortSchema,
      buildSchemaOptions: { numberScalarMode: 'integer' },
      playground: false,
      graphiql: true,
      installSubscriptionHandlers: true,
      includeStacktraceInErrorResponses: graphqlConfig && graphqlConfig.debug,
      autoTransformHttpErrors: true,
      // formatError: (error: GraphQLError) => ({
      //   message: error.message,
      //   code: error.extensions?.code || 'INTERNAL_ERROR',
      // }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      context: ({ req }) => ({ req }),
    };
  }
}
