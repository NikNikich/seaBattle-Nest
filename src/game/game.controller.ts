import {Get, Post, Put , HttpCode, Controller, Param, Query, Body} from '@nestjs/common';
import {GameService} from "./game.service";
import {CreateGameDto, MoveGameDto} from "./dto";

@Controller('user')
export class GameController {
    constructor(private readonly gameService: GameService) {}
    @Get()
    async find(@Body("userId")userId:number) {
        return await this.gameService.findAll(userId);
    }

    @Get("/attached")
    async attached(@Query('email') numberGame: string,@Body("userId")userId:number) {
        return await this.gameService.attached(numberGame, userId);
    }

    @Post()
    @HttpCode(200)
    async create(@Body() gameData: CreateGameDto, @Body("userId")userId:number) {
        return await this.gameService.create(gameData, userId);
    }

    @Put()
    async move( @Body() move: MoveGameDto, @Body("userId")userId:number) {
        await this.gameService.move(move, userId);
    }

}