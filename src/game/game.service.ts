import {HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../user/user.entity";
import {Repository} from "typeorm";
import {TokenEntity} from "../user/token.entity";
import {GameEntity} from "./game.entity";
import {UpdateUserDto} from "../user/dto";
import {ArrangementGameDto, CreateGameDto, MoveGameDto} from "./dto";
import {Not} from "typeorm";
import {HttpException} from "@nestjs/common/exceptions/http.exception";
import {validate} from "class-validator";
import {FieldEntity} from "../field/field.entity";
import {FieldShipEntity} from "../field/fieldShip.entity";
import {UserGameEntity} from "./userGame.entity";

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(GameEntity)
        private readonly gameRepository: Repository<GameEntity>,
        @InjectRepository(FieldEntity)
        private readonly fieldRepository: Repository<FieldEntity>,
        @InjectRepository(FieldShipEntity)
        private readonly fieldShipRepository: Repository<FieldShipEntity>,
        @InjectRepository(UserGameEntity)
        private readonly userGameRepository: Repository<UserGameEntity>,
        private readonly longField :10,
        private readonly compUserId :4,
    ) {
    }
    async findAll(userId: number) {
        const find = await this.gameRepository.find({
            "where": {
                "user1_id": Not(userId),
                "user2_id": null,
            }
        });
        return find;
    }

    async start(gameId: number) {
        const game = await this.gameRepository.findOne(gameId);
        return game.start;
    }

    async attached(numberGame: number, userId: number) {
        const findGame = await this.gameRepository.findOne(numberGame);
        if (findGame.user2) {
            throw new HttpException('Game not available.', HttpStatus.CONFLICT);
        } else {
            let addUser = await this.userRepository.findOne(userId);
            let updated = Object.assign(findGame, {user2: addUser});
            return await this.gameRepository.save(updated);
        }

    }

    async create(gameData: CreateGameDto, userId: number) {
        const user1 = await this.userRepository.findOne(userId);
        let user2 = null;
        if (gameData.user) {
            user2 = await this.userRepository.findOne(this.compUserId);
        }
        const game = await this.gameRepository.save({user1: user1, user2: user2});
        const gameField = await this.fieldRepository.save({content:"", length: this.longField});
        const hisField = await this.fieldRepository.save({content:"", length: this.longField});
        await this.userGameRepository.save({gameField, hisField, user:user1, game});
        if (user2) {
            const gameField = await this.fieldRepository.save({content:"", length: this.longField});
            const hisField = await this.fieldRepository.save({content:"", length: this.longField});
            await this.userGameRepository.save({gameField, hisField, user:user2, game});
        }
        return  game;
    }

    async arrangement(gameArrangement: ArrangementGameDto, userId: number) {
        const {gameId, ships} = gameArrangement;
        const game = await this.gameRepository.findOne(gameId);
        if ((game.user1.id!=userId)||(game.user2.id!=userId)){
            throw new HttpException('Not user game.', HttpStatus.CONFLICT);
        }
        const user = await this.userRepository.findOne(userId);
        const gameUser = await this.userGameRepository.find({
            "where": {
                user,
                game,
            }
        });
        const gameField = await this.fieldRepository.findOne(gameUser[0].gameField);
        const hisField = await this.fieldRepository.findOne(gameUser[0].hisField);
        let fieldNull = '';
        for (let i = 0; i < this.longField*this.longField; i++) {
            fieldNull+='0';
        }
        const shipsArr=ships.split(',').map(function(ship) {
            return ship.split('-');
        });
        let fieldShips = fieldNull;
        let numberShips=[0,0,0,0]
        shipsArr.forEach((ship)=>{
            const typeShip =+ship[0];
            const coordinatesShip =ship[1].split(':');
            numberShips[(typeShip-1)]+=1
            for (let i = 0; i < this.longField*this.longField; i++) {
                const coordinate=this.longField*(+coordinatesShip[0]+i*+coordinatesShip[2])+coordinatesShip[1]+i*(+coordinatesShip[3]);
                fieldShips[coordinate]=typeShip;
            }
        });
        const updatedGame = Object.assign(gameField, {content: fieldNull});
        await this.fieldRepository.save(updatedGame);
        const updatedHis = Object.assign(hisField, {content: fieldShips});
        await this.fieldRepository.save(updatedHis);
        if (game.user2.id==this.compUserId){
            await this.computerMoveShips(numberShips);
        }
    }

    async move(move: MoveGameDto, userId: number) {
        return "move";
    }

    private async computerMoveShips(numberShips:number[]){

    }
}