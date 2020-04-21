import {HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../user/user.entity";
import {Repository} from "typeorm";
import {TokenEntity} from "../user/token.entity";
import {GameEntity} from "./game.entity";
import {UpdateUserDto} from "../user/dto";
import {CreateGameDto, MoveGameDto} from "./dto";
import {Not} from "typeorm";
import {HttpException} from "@nestjs/common/exceptions/http.exception";
import {validate} from "class-validator";

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
        const find = await this.gameRepository.find({
            "where":{
                "user1_id":Not(userId),
                "user2_id":null,
        }});
        return find;
    }
    async attached( numberGame: number, userId:number) {
        const findGame = await this.gameRepository.findOne(numberGame);
        if(findGame.user2){
            throw new HttpException('Game not available.', HttpStatus.CONFLICT);
        } else{
            let addUser = await this.userRepository.findOne(userId);
            let updated = Object.assign(findGame, {user2:addUser});
            return await this.gameRepository.save(updated);
        }

    }
    async create( gameData: CreateGameDto, userId:number) {
        const user1 = await this.userRepository.findOne(userId);
        let user2=null;
        if (gameData.user){
            user2 = await this.userRepository.findOne(4);
        }
        return await this.gameRepository.save({user1:user1,user2:user2});
    }
    async move( move: MoveGameDto,userId:number) {
        return "move";
    }
}