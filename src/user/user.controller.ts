import {Get, Post, Put , HttpCode, Controller, Param, Query, Body} from '@nestjs/common';
import {validate} from "class-validator";
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './dto';
import {UserEntity} from "./user.entity";
import {Repository, getRepository, DeleteResult } from "typeorm";
import { TypeOrmModule } from '@nestjs/typeorm';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Get()
    async findOne(@Query('email') email: string,@Query('password')password: string)/*: Promise<string[]>*/ {
        console.log(`email ${email} pass ${password}`);
        let loginUserDto:LoginUserDto={email:email,password:password};
        return await this.userService.findOne(loginUserDto);
    }

    @Post()
    @HttpCode(200)
    async create(@Body() userData: CreateUserDto) {

        console.log(`emailpost ${userData.email} passpost ${userData.password}`);
        let ret=await this.userService.create(userData);
        console.log(`return ${ret}`);
        return ret;
    }
    @Put()
    async update( @Body() userData: UpdateUserDto) {
        console.log(`obj ${Object.keys(userData)} id ${userData.id}`);

        return await this.userService.update(userData);
    }

}