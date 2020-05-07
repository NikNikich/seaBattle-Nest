import {Get, Post, Put, HttpCode, Controller, Param, Query, Body, HttpStatus} from '@nestjs/common';
import {GameService} from "./game.service";
import {ArrangementGameDto, AttachedGameDto, CreateGameDto, MoveGameDto} from "./dto";
import {HttpException} from "@nestjs/common/exceptions/http.exception";

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}
    @Get()
    async find(@Body("userId")userId:number) {
        return await this.gameService.findAll(userId);
    }

    @Get("/myMove/:gameId")
    async myMove(@Param('gameId') gameId: number,@Body("userId")userId:number) {
        if((gameId==undefined)||(+gameId<1)){
            throw new HttpException('Not game id.', HttpStatus.CONFLICT);
        }
        return await this.gameService.myMove(gameId, userId);
    }

    @Get("/compMove/:gameId")
    async compMove(@Param('gameId') gameId: number,@Body("userId")userId:number) {
        if((gameId==undefined)||(+gameId<1)){
            throw new HttpException('Not game id.', HttpStatus.CONFLICT);
        }
        return await this.gameService.compMove(gameId, userId);
    }

    @Get("/start/:gameId")
    async start(@Param('gameId') gameId: number) {
        return await this.gameService.start(gameId);
    }

    @Get("/attached/:gameId")
    async attached(@Param('gameId') numberGame: number,@Body("userId")userId:number) {
        return await this.gameService.attached(numberGame, userId);
    }

    @Post()
    @HttpCode(200)
    async create(@Body() gameData: CreateGameDto, @Body("userId")userId:number) {
        return await this.gameService.create(gameData, userId);
    }

    @Put("/move")
    async move( @Body() move: MoveGameDto, @Body("userId")userId:number) {
        let regexp = /\d\d:\d\d/;
        if (move.coordinates.search(regexp)<0){
            throw new HttpException('Not ships.', HttpStatus.CONFLICT);
        }
        return await this.gameService.move(move, userId);
    }


    @Put("/arrangement")
    async arrangement( @Body() gameArrangement: ArrangementGameDto, @Body("userId")userId:number) {
        let regexp = /\d-\d\d:\d\d:\d:\d/;
       if (gameArrangement.ships.search(regexp)<0){
           throw new HttpException('Not ships.', HttpStatus.CONFLICT);
       }
        return await this.gameService.arrangement(gameArrangement, userId);
    }
}