import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserModule} from "./user/user.module";
import {GameModule} from "./game/game.module";
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    UserModule,
    GameModule,  
    TypeOrmModule.forRoot(),
    ],
  controllers: [AppController],
  providers: [AppService,  ConfigModule],

})
export class AppModule {}
