import {IsNotEmpty} from "class-validator";


export class AttachedGameDto {

    @IsNotEmpty()
    gameId: number;
}