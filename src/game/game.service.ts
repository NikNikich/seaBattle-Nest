import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../user/user.entity";
import {Repository} from "typeorm";
import {TokenEntity} from "../user/token.entity";
import {GameEntity} from "./game.entity";
import {UpdateUserDto} from "../user/dto";
import {CreateGameDto, MoveGameDto} from "./dto";

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(GameEntity)
        private readonly gameRepository: Repository<GameEntity>
    ) {
    }
    async findAll( userId:number) {
        return "find";
    }
    async attached( numberGame: string, userId:number) {
        return "attached";
    }
    async create( gameData: CreateGameDto, userId:number) {
        return "create";
    }
    async move( move: MoveGameDto,userId:number) {
        return "move";
    }
}