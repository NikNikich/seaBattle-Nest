import {IsEmail, IsNotEmpty, Length} from "class-validator";

export class CreateGameDto {

    @IsNotEmpty()
    user: boolean;
}