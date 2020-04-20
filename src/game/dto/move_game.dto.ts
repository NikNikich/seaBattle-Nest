import { IsNotEmpty} from "class-validator";

export class MoveGameDto {

    @IsNotEmpty()
    coordinates: string;
}