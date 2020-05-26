import {ConfigModule} from '@nestjs/config';
import {DatabaseService} from './database.service';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useClass: DatabaseService
    })
  ]
})
export class DatabaseModule {
}
