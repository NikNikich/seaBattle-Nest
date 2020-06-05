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
import {NUMBER_FIELD} from "../shared/enumGame";
import {COMPUTER_USER, LONG_FIELD} from "../shared/constGame";

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
    private readonly longField = LONG_FIELD;
    private readonly compUserId = COMPUTER_USER;
    private readonly bangShip =NUMBER_FIELD.bangShip;
    private readonly shutPast =NUMBER_FIELD.shutPast;


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
        if ((game.walking)&&(game.walking.id==userId)){
            return true;
        } else {
            return false;
        }
    }

    async compMove(gameId: number, userId) {
        const game = await this.gameRepository.findOne(gameId);
        if ((game.walking)&&(game.walking.id==this.compUserId)){
            const userComp = await this.userRepository.findOne(this.compUserId);
            const gameComp = await this.userGameRepository.find({
                "where": {
                    user:userComp,
                    game,
                }
            });
            const gameFieldComp = await this.fieldRepository.findOne(gameComp[0].gameField);
            const user = await this.userRepository.findOne(userId);
            const gameUser = await this.userGameRepository.find({
                "where": {
                    user,
                    game,
                }
            });
            const hisFieldUser= await this.fieldRepository.findOne(gameUser[0].hisField);
            let placeShut=[];
            for (let i = 0; i < gameFieldComp.content.length; i++) {
                if(gameFieldComp.content[i]=='0'){
                    placeShut.push(i);
                }
            }
            const keyPlaceShut = Math.floor(  Math.random() * (placeShut.length));
            let stringCoordinate=placeShut[keyPlaceShut];
            console.log("CompShut");
            console.log(stringCoordinate);
            if (hisFieldUser.content[stringCoordinate]=='0'){
                gameFieldComp.content=gameFieldComp.content.slice(0,stringCoordinate)+this.shutPast+gameFieldComp.content.slice(stringCoordinate+1);
                await this.fieldRepository.save(gameFieldComp);
                game.walking=user;
                await this.gameRepository.save(game);
                this.showContent(gameFieldComp.content);
                return {message:"Computer missed. Yours Rival",field:gameFieldComp};
            } else if(+hisFieldUser.content[stringCoordinate]<this.bangShip){
                gameFieldComp.content=await this.hitShip(hisFieldUser.content, gameFieldComp.content ,Math.trunc(  stringCoordinate/this.longField),stringCoordinate%this.longField);
                await this.fieldRepository.save(gameFieldComp);
                this.showContent(gameFieldComp.content);
                if(await this.gameOver(gameFieldComp.content,hisFieldUser.content)){
                    game.winner=userId;
                    await this.gameRepository.save(game);
                    return {message:"Computer win",field:gameFieldComp};
                } else{
                    return {message:"Computer hit yor ship. His shot",field:gameFieldComp};
                }
            } else {
                throw new HttpException('Bugs Shot', HttpStatus.CONFLICT);
            }
        } else {
            throw new HttpException('Not computer turn.', HttpStatus.CONFLICT);
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
        let newGame:{[k: string]: any}={user1: user1, user2: user2};
        if (gameData.user) {
            user2 = await this.userRepository.findOne(this.compUserId);
            newGame.level=0;
        }
        const game = await this.gameRepository.save(newGame);
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
            const fieldShipsComp = await this.computerMoveShips(fieldNull,numberShips);
            const updatedGame = Object.assign(gameFieldComp, {content: fieldNull});
            await this.fieldRepository.save(updatedGame);
            const updatedHis = Object.assign(hisFieldComp, {content: fieldShipsComp});
            await this.fieldRepository.save(updatedHis);
            game.start=true;
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
                game.start=true;
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
        const stringCoordinate:number=this.longField * (+coordinatesMove[0]) + (+coordinatesMove[1]);
        if (gameField.content[stringCoordinate]!=='0'){
            throw new HttpException('Bugs Shot', HttpStatus.CONFLICT);
        }
        if (rivalField.content[stringCoordinate]=='0'){
            gameField.content=gameField.content.slice(0,stringCoordinate)+this.shutPast+gameField.content.slice(stringCoordinate+1);
            await this.fieldRepository.save(gameField);
            game.walking=rivalUser;
            await this.gameRepository.save(game);
            this.showContent(gameField.content);
            return {message:"You missed. Shutting your Rival",field:gameField};
        } else if(+rivalField.content[stringCoordinate]<this.bangShip){
            gameField.content=await this.hitShip(rivalField.content, gameField.content ,+coordinatesMove[0],+coordinatesMove[1]);
            await this.fieldRepository.save(gameField);
            this.showContent(gameField.content);
            if(await this.gameOver(gameField.content,rivalField.content)){
                game.winner=userId;
                await this.gameRepository.save(game);
                return {message:"You win",field:gameField};
            } else{
                return {message:"You hit ship. Your shot",field:gameField};
            }
        } else {
            throw new HttpException('Bugs Shot', HttpStatus.CONFLICT);
        }
    }
    private async gameOver(gameField:string, shipsField): Promise<boolean> {
        let flagOver=true;
        for (let i = 0; i < shipsField.length; i++) {
            if (+shipsField[i]>0){
                if(+gameField[i]==0) {
                    flagOver = false;
                }
            }
        }
        return  flagOver;
    }

    private async hitShip(shipField:string,gameField:string, coordinateX:number, coordinateY:number): Promise<string> {
        let coordinateShip=[[coordinateX,coordinateY]];
        let keyShot:number=this.longField*+coordinateX+coordinateY;
        gameField=gameField.slice(0,keyShot)+this.bangShip+gameField.slice(keyShot+1);
        let returnField=gameField;
        const typeShip=shipField[this.longField*coordinateX+coordinateY];
        let directions=[-1,1];
        directions.forEach((direct)=>{
            let flagDirect=true;
            let step=1;
            while(flagDirect){
                if((coordinateX-direct*step>-1)&&(coordinateX-direct*step<this.longField)&&
                    shipField[this.longField*(coordinateX-direct*step)+coordinateY]==typeShip){
                    coordinateShip.push([coordinateX-direct*step,coordinateY]);
                    step++;
                } else {
                    flagDirect=false;
                }
            }
            flagDirect=true;
            step=1;
            while(flagDirect){
                if((coordinateY-direct*step>-1)&&(coordinateY-direct*step<this.longField)&&
                    shipField[this.longField*coordinateX+coordinateY-direct*step]==typeShip){
                    coordinateShip.push([coordinateX,coordinateY-direct*step]);
                    step++;
                } else {
                    flagDirect=false;
                }
            }
        });
        let total=0;
        await coordinateShip.forEach((coordinate)=>{
            let key:number=this.longField*+coordinate[0]+coordinate[1];
            if(+gameField[key]==this.bangShip){
             total++;
            }
        });
        if (total==(coordinateShip.length)){
            coordinateShip.forEach((coordinate)=>{
                let key:number=this.longField*+coordinate[0]+coordinate[1];
                    returnField=returnField.slice(0,key)+this.bangShip+returnField.slice(key+1);
                    directions.forEach((direct)=>{
                        if((coordinate[0]-direct>-1)&&(coordinate[0]-direct<this.longField)&&
                            gameField[this.longField*(coordinate[0]-direct)+coordinate[1]]=='0'){
                            let keyBum:number=this.longField*(coordinate[0]-direct)+coordinate[1];
                            returnField=returnField.slice(0,keyBum)+this.shutPast+returnField.slice(keyBum+1);
                        }
                        if((coordinate[1]-direct>-1)&&(coordinate[1]-direct<this.longField)&&
                            gameField[this.longField*coordinate[0]+coordinate[1]-direct]=='0'){
                            let keyBum:number=this.longField*coordinate[0]+coordinate[1]-direct;
                            returnField=returnField.slice(0,keyBum)+this.shutPast+returnField.slice(keyBum+1);
                        }
                    })
            });

        }
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
        let ships;
        let flagEndGeneration=false;
        newArrangement:
        while (!flagEndGeneration) {
            let numbersFieldJob = numbersField;
            ships = [];
            //numberShips.forEach((numberShips, numberTypeShip)=>{
            for (let numberTypeShip = numberShips.length; numberTypeShip > 0; numberTypeShip--) {
                const typeShip = numberTypeShip;
                const numberShip = numberShips[numberTypeShip - 1];
                for (let i = 0; i < numberShip; i++) {
                    let flagWrite = false;
                    while (!flagWrite) {
                        if (numbersFieldJob.length==0){
                            continue newArrangement;
                        }
                        const beginCoordinates = this.getRandomCoordinates(numbersFieldJob);
                        const beginCoordinateKey = beginCoordinates[4];
                        if (numbersFieldJob[beginCoordinateKey]){
                            numbersField.slice(beginCoordinateKey,1)
                        } else {
                            continue newArrangement;
                        }
                        let fieldCoordinates = [];
                        let flagGoodCoordinates = true;
                        for (let j = 0; j < typeShip; j++) {
                            const XCoordinate = beginCoordinates[0] + j * beginCoordinates[2];
                            const YCoordinate = beginCoordinates[1] + j * beginCoordinates[3];
                            if (!((XCoordinate < this.longField) && (YCoordinate < this.longField))) {
                                flagGoodCoordinates = false;
                                continue;
                            } else {
                                if (fieldShips[XCoordinate][YCoordinate] > 0) {
                                    flagGoodCoordinates = false;
                                }
                            }
                            let directX = [1];
                            let directY = [1];
                            if (j == 0) {
                                directX.push(-1);
                                directY.push(-1);
                            } else if (beginCoordinates[2] > 0) {
                                directY.push(-1);
                            } else if (beginCoordinates[3] > 0) {
                                directX.push(-1);
                            }
                            directX.forEach((direct) => {
                                if (!(((XCoordinate + direct) >= this.longField) || ((XCoordinate + direct) < 0) ||
                                    (fieldShips[XCoordinate + direct][YCoordinate] == 0))) {
                                    flagGoodCoordinates = false;
                                }
                            });
                            directY.forEach((direct) => {
                                if (!(((YCoordinate + direct) >= this.longField) || ((YCoordinate + direct) < 0) ||
                                    (fieldShips[XCoordinate][YCoordinate + direct] == 0))) {
                                    flagGoodCoordinates = false;
                                }
                            })
                            if (flagGoodCoordinates) {
                                fieldCoordinates.push([XCoordinate, YCoordinate]);
                            }
                        }
                        if (flagGoodCoordinates) {
                            ships.push([typeShip, fieldCoordinates]);
                            fieldShips = this.pushShipInField(typeShip, fieldShips, fieldCoordinates)
                            flagWrite = true;
                        }
                    }
                }
            }
            flagEndGeneration=true;
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

    private  getRandomCoordinates(numbersField:number[]): number[] {
        let coordinate=[];
        const keyArray = Math.floor(  Math.random() * (numbersField.length));
        coordinate[0]= Math.trunc(  numbersField[keyArray]/this.longField);
        coordinate[1]= numbersField[keyArray]%this.longField;
        let direction= Math.floor(  Math.random() * (2));
        if(direction ==1){
            coordinate[2]=0;
            coordinate[3]=1;
        } else {
            coordinate[2]=1;
            coordinate[3]=0;
        }
        coordinate[4]=keyArray;
        return coordinate;
    }

    private  showContent(content:string){
        let fieldShips =[];
        console.info('field');
        for (let i = 0; i < this.longField; i++) {
            fieldShips[i]=[];
            for (let j = 0; j < this.longField; j++) {
                fieldShips[i][j]=content[i*this.longField+j];
            }
            console.log(fieldShips[i].join());
        }

    }
}