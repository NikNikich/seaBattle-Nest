import { IsNotEmpty, Length, IsEmail} from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  readonly id: string;

  @Length(6,200)
  readonly firstName: string;

  @IsEmail()
  readonly email: string;

  @Length(6,200)
  readonly lastName: string;
}