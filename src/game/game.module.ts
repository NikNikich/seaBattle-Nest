import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { GameEntity } from './game.entity';
import { GameService } from './game.service';
import { AuthMiddleware } from '../auth/auth.middleware';
import {UserService} from "../user/user.service";
import {TokenEntity} from "../user/token.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]), TypeOrmModule.forFeature([GameEntity]), TypeOrmModule.forFeature([TokenEntity])],
    providers: [GameService, UserService],
    controllers: [
       GameController
    ],
    exports: [GameService]
})
export class GameModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
            consumer
                .apply(AuthMiddleware)
                .forRoutes( {path: 'game', method: RequestMethod.ALL });
    }
}
