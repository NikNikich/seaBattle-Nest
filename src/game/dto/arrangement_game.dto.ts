import {IsNotEmpty} from "class-validator";


export class ArrangementGameDto {
    @IsNotEmpty()
    gameId: number;

    @IsNotEmpty()
    ships: string;
}