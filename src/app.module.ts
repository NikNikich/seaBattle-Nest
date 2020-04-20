import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserModule} from "./user/user.module";
import {GameModule} from "./game/game.module";

@Module({
  imports: [
    UserModule,
    GameModule,  
    TypeOrmModule.forRoot(),
    ],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}
