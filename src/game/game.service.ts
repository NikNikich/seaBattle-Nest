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
    ) {
    }
    private readonly longField :10;
    private readonly compUserId :4;
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
            for (let i = 0; i < typeShip; i++) {
                const coordinate=this.longField*(+coordinatesShip[0]+i*+coordinatesShip[2])+coordinatesShip[1]+i*(+coordinatesShip[3]);
                fieldShips[coordinate]=typeShip;
            }
        });
        const updatedGame = Object.assign(gameField, {content: fieldNull});
        await this.fieldRepository.save(updatedGame);
        const updatedHis = Object.assign(hisField, {content: fieldShips});
        await this.fieldRepository.save(updatedHis);
        if (game.user2.id==this.compUserId){
            const userComp = await this.userRepository.findOne(userId);
            const gameUserComp = await this.userGameRepository.find({
                "where": {
                    user:userComp,
                    game,
                }
            });
            const gameFieldComp = await this.fieldRepository.findOne(gameUserComp[0].gameField);
            const hisFieldComp = await this.fieldRepository.findOne(gameUserComp[0].hisField);
            const fieldShipsComp=await this.computerMoveShips(fieldNull,numberShips);
            const updatedGame = Object.assign(gameFieldComp, {content: fieldNull});
            await this.fieldRepository.save(updatedGame);
            const updatedHis = Object.assign(hisFieldComp, {content: fieldShipsComp});
            await this.fieldRepository.save(updatedHis);
        }
    }


    async move(move: MoveGameDto, userId: number) {
        const {gameId, coordinates} = move;
        const game = await this.gameRepository.findOne(gameId);
        if (game.walking.id!=userId){
            throw new HttpException('Not user game.', HttpStatus.CONFLICT);
        }
        let rivalUser:UserEntity;
        const user = await this.userRepository.findOne(userId);
        const gameUser = await this.userGameRepository.find({
            "where": {
                user,
                game,
            }
        });
        if (game.user1.id==userId){
            rivalUser=game.user2;
        } else rivalUser=game.user1;
        const gameRival = await this.userGameRepository.find({
            "where": {
                rivalUser,
                game,
            }
        });
        const gameField = await this.fieldRepository.findOne(gameUser[0].gameField);
        const rivalField = await this.fieldRepository.findOne(gameRival[0].hisField);
        const coordinatesMove =coordinates.split(':');
        return "move";
    }

    private async computerMoveShips(fieldNull:string,numberShips:number[]):Promise<string>{
        let fieldShips=[];
        for (let i = 0; i < this.longField; i++) {
            for (let j = 0; j < this.longField; j++) {
                fieldShips[i][j]=0;
            }
        }
        let ships=[];
        numberShips.forEach((numberShips, numberTypeShip)=>{
            const typeShip=numberTypeShip+1;
            for (let i = 0; i < numberShips; i++) {
                let flagWrite=false;
                while(flagWrite){
                    const beginCoordinates= this.getRandomCoordinates();
                    let fieldCoordinates=[];
                    let flagGoodCoordinates=true;
                    for (let j = 0; j < typeShip; j++) {
                        const XCoordinate=beginCoordinates[0]+j*beginCoordinates[3];
                        const YCoordinate=beginCoordinates[1]+j*beginCoordinates[4];
                        if(!((XCoordinate<this.longField)&&(YCoordinate<this.longField))){
                            flagGoodCoordinates=false;
                            continue;
                        } else {
                            if(fieldShips[XCoordinate][YCoordinate]>0){
                                flagGoodCoordinates=false;
                            }
                        }
                        let directX=[1];
                        let directY=[1];
                        if(j==0){
                          directX.push(-1)  ;
                          directY.push(-1)  ;
                        } else if(beginCoordinates[3]>0){
                            directY.push(-1)  ;
                        } else if(beginCoordinates[3]>0){
                            directX.push(-1)  ;
                        }
                        directX.forEach((direct)=>{
                            if(!(((XCoordinate+direct)>=this.longField)||((XCoordinate+direct)<0)||
                                (fieldShips[XCoordinate+direct][YCoordinate]==0))){
                                flagGoodCoordinates=false;
                            }
                        });
                        directY.forEach((direct)=>{
                            if(!(((YCoordinate+direct)>=this.longField)||((YCoordinate+direct)<0)||
                                (fieldShips[XCoordinate][YCoordinate+direct]==0))){
                                flagGoodCoordinates=false;
                            }
                        })
                        if(flagGoodCoordinates){
                            fieldCoordinates.push([XCoordinate,YCoordinate]);
                        }
                    }
                    if (flagGoodCoordinates){
                        ships.push([typeShip,fieldCoordinates]);
                        fieldShips=this.pushShipInField(typeShip,fieldShips,fieldCoordinates)
                        flagWrite=true;
                    }
                }
            }
        });
        let fieldCompReturn=fieldNull;
        ships.forEach((ship)=>{
            ship[1].forEach((coordinate)=>{
                // @ts-ignore
                fieldCompReturn[(this.longField*coordinate[0]+coordinate[1])]=ship[0];
            });
        });
        return fieldCompReturn;
    }

    pushShipInField(typeShip:number,fieldBattle:number[],shipCoordinates:number[]):number[] {
        const directs=[1,-1];
        let returnField=fieldBattle;
        shipCoordinates.forEach((coordinate)=>{
            const XCoordinateShip=coordinate[0];
            const YCoordinateShip=coordinate[1];
            returnField[XCoordinateShip][YCoordinateShip]=typeShip;
            directs.forEach((direct)=>{
                if(((XCoordinateShip+direct)>=0)&&((XCoordinateShip+direct)<this.longField)){
                    returnField[XCoordinateShip+direct][YCoordinateShip]=9;
                }
                if(((YCoordinateShip+direct)>=0)&&((YCoordinateShip+direct)<this.longField)){
                    returnField[XCoordinateShip][YCoordinateShip+direct]=9;
                }
            });
        })
        return returnField;
    }

    private  getRandomCoordinates(): number[] {
        let coordinate=[];
        coordinate[0]= Math.floor(  Math.random() * (this.longField + 1));
        coordinate[1]= Math.floor(  Math.random() * (this.longField + 1));
        let direction= Math.floor(  Math.random() * (2));
        if(direction ==1){
            coordinate[2]=0;
            coordinate[3]=1;
        } else {
            coordinate[2]=1;
            coordinate[3]=0;
        }
        return coordinate;
    }

}