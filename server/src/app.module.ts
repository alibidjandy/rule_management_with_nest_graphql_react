import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { GraphQLSchema } from 'graphql';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
// import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { AuthResolver } from './auth/auth.resolver';
import { AuthService } from './auth/auth.service';
import { JWTAccessAuthGuard } from './auth/guards/JWTAccessAuth.guard';
import { CaslModule } from './casl/casl.module';
import { upperDirectiveTransformer } from './common/directives/upper-case.directive';
import { __prod__ } from './constants';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { UserResolver } from './user/user.resolver';
import { UserService } from './user/user.service';
import { PaginateService } from './utils/paginate/paginate.service';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      transformSchema: (schema: GraphQLSchema) =>
        upperDirectiveTransformer(schema, 'upper'),
      playground: false,
      // plugins: [ApolloServerPluginLandingPageLocalDefault()],
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
      context: ({ req }) => {
        req;
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    // TypeOrm configurations
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: configService.get('DB_TYPE'),
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: !__prod__,
          logging: true,
          autoLoadEntities: true,
          // ssl: true,
        } as TypeOrmModuleOptions;
      },
      inject: [ConfigService],
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
    // TypeOrmModule.forRoot({
    //   type: 'sqlite',
    //   database: 'db.sqlite',
    //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   synchronize: true,
    // }),
    // End of TypeOrm configurations
    ConfigModule.forRoot(),
    UserModule,
    AuthModule,
    RoleModule,
    CaslModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UserService,
    UserResolver,
    AuthService,
    AuthResolver,
    PaginateService,
    // Allows to use dependency injection inside JWTAccessAuthGuards
    {
      provide: 'APP_GUARD',
      useClass: JWTAccessAuthGuard,
    },
  ],
})
export class AppModule {}
