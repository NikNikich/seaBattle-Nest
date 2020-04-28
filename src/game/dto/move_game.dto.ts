import { IsNotEmpty} from "class-validator";

export class MoveGameDto {

    @IsNotEmpty()
    gameId: number;

    @IsNotEmpty()
    coordinates: string;
}