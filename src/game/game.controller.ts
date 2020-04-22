import {Get, Post, Put , HttpCode, Controller, Param, Query, Body} from '@nestjs/common';
import {GameService} from "./game.service";
import {ArrangementGameDto, AttachedGameDto, CreateGameDto, MoveGameDto} from "./dto";

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}
    @Get()
    async find(@Body("userId")userId:number) {
        return await this.gameService.findAll(userId);
    }

    @Get("/start")
    async start(@Query('game') gameId: number) {
        return await this.gameService.start(gameId);
    }

    @Get("/attached")
    async attached(@Query('game') numberGame: number,@Body("userId")userId:number) {
        return await this.gameService.attached(numberGame, userId);
    }

    @Post()
    @HttpCode(200)
    async create(@Body() gameData: CreateGameDto, @Body("userId")userId:number) {
        return await this.gameService.create(gameData, userId);
    }

    @Put("/move")
    async move( @Body() move: MoveGameDto, @Body("userId")userId:number) {
        return await this.gameService.move(move, userId);
    }

    @Put("/arrangement")
    async arrangement( @Body() gameArrangement: ArrangementGameDto, @Body("userId")userId:number) {
        return await this.gameService.arrangement(gameArrangement, userId);
    }
}