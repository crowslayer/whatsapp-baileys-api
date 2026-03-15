export interface IApiConfig {
  port: number;
  path: string;
  version: string;
  url: string | null;
}
export type DatabaseType = 'typeorm' | 'sequelize' | 'mongoose';

export interface IBaseDatabaseConfig {
  enabled: boolean;
  type: DatabaseType;
}

export type SecurityType = 'jwt' | 'oauth2';
export interface IBaseSecurityConfig {
  enabled: boolean;
  type: SecurityType;
  cors: {
    origins: string[];
  };
  protectRoutes: boolean;
  enabledRateLimit?: boolean;
}
export interface IJwtConfig {
  secret: string;
  expires: number | string;
  refreshExpires: number | string;
}
// TypeORM Configuration
export interface ITypeORMConfig extends IBaseDatabaseConfig {
  type: 'typeorm';
  dialect: 'mysql' | 'postgres' | 'sqlite' | 'mssql';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database: string;
  entities: string[]; // paths to your entities
  migrations?: string[];
  subscribers?: string[];
  cli?: {
    entitiesDir?: string;
    migrationsDir?: string;
    subscribersDir?: string;
  };
  options?: Record<string, unknown>;
}

// Sequelize Configuration
export interface ISequelizeConfig extends IBaseDatabaseConfig {
  type: 'sequelize';
  dialect: 'mysql' | 'postgres' | 'sqlite' | 'mssql';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database: string;
  models: string[]; // paths to your models
  syncronize?: boolean;
  logging?: boolean;
  options?: Record<string, unknown>;
}

// Mongoose Configuration
export interface IMongooseConfig extends IBaseDatabaseConfig {
  type: 'mongoose';
  uri: string;
  options?: Record<string, unknown>; // Mongoose options
}

export type IDatabaseConfig = ITypeORMConfig | ISequelizeConfig | IMongooseConfig;

// JWT Security Configuration
export interface IJwtSecurityConfig extends IBaseSecurityConfig {
  type: 'jwt';
  jwt: IJwtConfig;
}

// OAuth 2.0 Security Configuration
export interface IOAuth2SecurityConfig extends IBaseSecurityConfig {
  type: 'oauth2';
  // Specific OAuth configurations here
  clientId: string;
  clientSecret: string;
  authorizationServer: string;
  options?: Record<string, unknown>;
}

export type ISecurityConfig = IJwtSecurityConfig | IOAuth2SecurityConfig;
export type Environment = 'development' | 'production' | 'test' | 'staging';
export interface IConfig {
  environment: string;
  api: IApiConfig;
  database?: IDatabaseConfig;
  security?: ISecurityConfig;
}
