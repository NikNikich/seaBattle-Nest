import { IsNotEmpty, Length, IsEmail} from 'class-validator';

export class CreateUserDto {

  @IsNotEmpty()
  @Length(3,200)
  readonly firstName: string;

  @IsNotEmpty()
  @Length(3,200)
  readonly lastName: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @Length(6,100)
  readonly password: string;

  @Length(11,11)
  readonly phone: string;
}