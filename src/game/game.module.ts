import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { GameEntity } from './game.entity';
import { GameService } from './game.service';
import { AuthMiddleware } from '../auth/auth.middleware';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]), TypeOrmModule.forFeature([GameEntity])],
    providers: [GameService],
    controllers: [
       GameController
    ],
    exports: [GameService]
})
export class GameModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
    }
}
