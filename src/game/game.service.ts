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
    private readonly longField = 10;
    private readonly compUserId = 4;
    private readonly bangShip =8;
    private readonly shutPast =9;


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

    async myMove(gameId: number, userId) {
        const game = await this.gameRepository.findOne(gameId);
        if ((game.walking.id!=null)&&(game.walking.id==userId)){
            return true;
        } else {
            return false;
        }
    }

    async attached(numberGame: number, userId: number) {
        const findGame = await this.gameRepository.findOne(numberGame);
        if (findGame.user2) {
            throw new HttpException('Game not available.', HttpStatus.CONFLICT);
        } else if(findGame.user1.id==userId){
            throw new HttpException('It is your game.', HttpStatus.CONFLICT);
        } else{
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
        if ((game.user1.id!=userId)&&(game.user2.id!=userId)){
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
                const coordinateX=(+coordinatesShip[0])+i*(+coordinatesShip[2]);
                const coordinateY=(+coordinatesShip[1])+i*(+coordinatesShip[3]);
                const coordinate:number=this.longField*(coordinateX)+coordinateY;
                fieldShips=fieldShips.slice(0,coordinate)+ship[0]+fieldShips.slice(coordinate+1);
            }
        });
        const updatedGame = Object.assign(gameField, {content: fieldNull});
        await this.fieldRepository.save(updatedGame);
        const updatedHis = Object.assign(hisField, {content: fieldShips});
        await this.fieldRepository.save(updatedHis);
        if (game.user2.id==this.compUserId){
            const userComp = await this.userRepository.findOne(this.compUserId);
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
            game.walking=game.user1;
            await this.gameRepository.save(game);
            return game;
        } else {
            let rivalUser:UserEntity;
            if (game.user1.id == userId) {
                rivalUser = game.user2;
            } else rivalUser = game.user1;
            const rivalField = await this.getRivalField(rivalUser,game);
            if (rivalField.content.length>2){
                game.walking=game.user1;
                await this.gameRepository.save(game);
                return game;
            } else {
                return "holding";
            }

        }
    }

    private async getRivalField(user:UserEntity, game:GameEntity): Promise<FieldEntity> {
        const gameRival = await this.userGameRepository.find({
            "where": {
                user,
                game,
            }
        });
       return  await this.fieldRepository.findOne(gameRival[0].hisField);

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
        const gameField = await this.fieldRepository.findOne(gameUser[0].gameField);
        const rivalField = await this.getRivalField(rivalUser,game);
        const coordinatesMove =coordinates.split(':');
        const stringCoordinate:number=Number(this.longField * +coordinatesMove[0] + coordinatesMove[1]);
        if (rivalField.content[stringCoordinate]=='0'){
            gameField.content=gameField.content.slice(0,stringCoordinate)+this.shutPast+gameField.content.slice(stringCoordinate+1);
            await this.fieldRepository.save(gameField);
            game.walking=rivalUser;
            await this.gameRepository.save(game);
            return {message:"You missed. Shutting your Rival",field:gameField};
        } else if(+rivalField.content[stringCoordinate]<this.bangShip){
            gameField.content=await this.hitShip(rivalField.content,+coordinatesMove[0],+coordinatesMove[1]);
            await this.fieldRepository.save(gameField);
            if(await this.gameOver(gameField.content)){
                game.winner=userId;
                await this.gameRepository.save(game);
                return {message:"You win",field:gameField};
            } else{
                return {message:"You hit ship. Your shot",field:gameField};
            }

        }else {
            throw new HttpException('Not ships.', HttpStatus.CONFLICT);
        }
    }
    private async gameOver(field:string): Promise<boolean> {
        let flagOver=true;
        for (let i = 1; i < this.bangShip; i++) {
            if (field.indexOf(''+i)>0){
                flagOver=false;
            }
        }
        return  flagOver;
    }

    private async hitShip(field:string, coordinateX:number, coordinateY:number): Promise<string> {
        let coordinateShip=[[coordinateX,coordinateY]];
        let returnField=field;
        const typeShip=field[this.longField*coordinateX+coordinateY];
        let directions=[-1,1];
        directions.forEach((direct)=>{
            let flagDirect=true;
            let step=1;
            while(flagDirect){
                if((coordinateX-direct*step>-1)&&(coordinateX-direct*step<this.longField)&&
                field[this.longField*(coordinateX-direct*step)+coordinateY]==typeShip){
                    step++;
                    coordinateShip.push([coordinateX-direct*step,coordinateY]);
                } else {
                    flagDirect=false;
                }
            }
            flagDirect=true;
            step=1;
            while(flagDirect){
                if((coordinateY-direct*step>-1)&&(coordinateY-direct*step<this.longField)&&
                    field[this.longField*coordinateX+coordinateY-direct*step]==typeShip){
                    step++;
                    coordinateShip.push([coordinateX,coordinateY-direct*step]);
                } else {
                    flagDirect=false;
                }
            }
        });
        coordinateShip.forEach((coordinate)=>{
            let key:number=this.longField*+coordinate[0]+coordinate[1];
            returnField=returnField.slice(0,key)+this.bangShip+returnField.slice(key+1);
            directions.forEach((direct)=>{
                if((coordinate[0]-direct>-1)&&(coordinate[0]-direct<this.longField)&&
                    field[this.longField*(coordinate[0]-direct)+coordinate[1]]=='0'){
                    let keyBum:number=this.longField*(coordinate[0]-direct)+coordinate[1];
                    returnField=returnField.slice(0,keyBum)+this.shutPast+returnField.slice(keyBum+1);
                }
                if((coordinate[1]-direct>-1)&&(coordinate[1]-direct<this.longField)&&
                    field[this.longField*coordinate[0]+coordinate[1]-direct]=='0'){
                    let keyBum:number=this.longField*coordinate[0]+coordinate[1]-direct;
                    returnField=returnField.slice(0,keyBum)+this.shutPast+returnField.slice(keyBum+1);
                }
            })
        });
        return returnField;
    }

    private async computerMoveShips(fieldNull:string,numberShips:number[]):Promise<string>{
        let fieldShips =[];
        let numbersField=[];
        for (let i = 0; i < this.longField; i++) {
            fieldShips[i]=[];
            for (let j = 0; j < this.longField; j++) {
                numbersField.push(i*this.longField+j);
                fieldShips[i][j]=0;
            }
        }
        let numbersFieldJob=numbersField;
        let ships=[];
        //numberShips.forEach((numberShips, numberTypeShip)=>{
        for (let numberTypeShip = numberShips.length; numberTypeShip >0; numberTypeShip--) {
            const typeShip=numberTypeShip;
            const numberShip=numberShips[numberTypeShip-1];
            for (let i = 0; i < numberShip; i++) {
                let flagWrite=false;
                let attemptCounter=0;
                while(!flagWrite){
                    const beginCoordinates= this.getRandomCoordinates();
                    let fieldCoordinates=[];
                    let flagGoodCoordinates=true;
                    for (let j = 0; j < typeShip; j++) {
                        const XCoordinate=beginCoordinates[0]+j*beginCoordinates[2];
                        const YCoordinate=beginCoordinates[1]+j*beginCoordinates[3];
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
                        } else if(beginCoordinates[2]>0){
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
                    } else{
                        if (attemptCounter>1000000){
                            console.log("ай-яй-яй "+ attemptCounter);
                        }
                        attemptCounter++;
                    }

                }
            }
        }
        let fieldCompReturn=fieldNull;
        ships.forEach((ship)=>{
            ship[1].forEach((coordinate)=>{
                let keyBum:number=(this.longField*coordinate[0]+coordinate[1]);
                fieldCompReturn=fieldCompReturn.slice(0,keyBum)+ship[0]+fieldCompReturn.slice(keyBum+1);
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