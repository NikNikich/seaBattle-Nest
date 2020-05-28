//import {ConfigService} from '@nestjs/config';
import {Injectable} from '@nestjs/common';
import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from '@nestjs/typeorm';
import {resolve} from 'path';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {

  constructor() {
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host:  'localhost',
      port:  5432,
      username: 'postgres',
      password: 'postgres',
      database: 'sea',
      entities: [`${resolve(__dirname, '..')}/**/*.entity{.ts,.js}`],
      migrations: [`${resolve(__dirname)}/migrations/{*.ts,*.js}`],
      migrationsRun: false,
      logging:  'all',
      cli: {migrationsDir: './migrations'},
      synchronize: false
    };
  }
}
