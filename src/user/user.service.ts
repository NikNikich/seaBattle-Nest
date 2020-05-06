import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult } from 'typeorm';
import { UserEntity } from './user.entity';
import {CreateUserDto, LoginUserDto, UpdateUserDto} from './dto';
import {validate} from "class-validator";
import {TokenEntity} from "./token.entity";
const jwt = require('jsonwebtoken');

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(TokenEntity)
        private readonly tokenRepository: Repository<TokenEntity>
    ) {}

    async findAll(): Promise<UserEntity[]> {
        return await this.userRepository.find();
    }

    async findOne(loginUserDto: LoginUserDto) {
        const findOneOptions = {
            email: loginUserDto.email,
            password:  loginUserDto.password,
        };
        let userFind=await this.userRepository.findOne(findOneOptions);

        if (userFind) {
            console.log(`findOne ${userFind.id}`);
            const token = await this.tokenRepository.findOne({user:userFind});
            const {email, firstName, lastName} = userFind;
            return {email, token, firstName, lastName};
        } else return "Not Found";
    }

    async create(dto: CreateUserDto):Promise<any>{
        const {lastName, firstName, email, password, phone} = dto;
        console.log(`const create userne ${firstName}  email ${email} password ${password}`);
        const user = await this.userRepository.findOne({email});
            /*await getRepository(UserEntity)
            .createQueryBuilder('user')
            .where('user.first_name = :firstName', { firstName })
            .orWhere('user.email = :email', { email });*/
        if (user) {
            console.log(`err0`);
            const errors = {username: 'Username and email must be unique.',
                errors:user};
            throw new HttpException({message: 'Input data validation failed', errors}, HttpStatus.BAD_REQUEST);

        }
        // create new user
        let newUser = new UserEntity();
        newUser.lastName = lastName;
        newUser.firstName = firstName;
        newUser.email = email;
        newUser.password = password;
        newUser.phone = phone;
        console.log(newUser);
        const errors = await validate(newUser);
        if (errors.length > 0) {
            console.log(`err1`);
            const _errors = {username: 'User input is not valid.',errors:errors};
            throw new HttpException({message: 'Input data validation failed', _errors}, HttpStatus.BAD_REQUEST);

        } else {
            let newToken = new TokenEntity();
            const savedUser = await this.userRepository.save(newUser);
            const token = await this.generateJWT(newUser);
            await this.tokenRepository.save({user:savedUser, accessToken:token });
            return "user Save";
        }

    }

    async update( dto: UpdateUserDto): Promise<UserEntity> {
        let toUpdate = await this.userRepository.findOne(dto.id);

        let updated = Object.assign(toUpdate, dto);
        return await this.userRepository.save(updated);
    }

    async delete(email: string): Promise<DeleteResult> {
        return await this.userRepository.delete({ email: email});
    }

    public generateJWT(user) {
        let today = new Date();
        let exp = new Date(today);
        exp.setDate(today.getDate() + 60);

        return jwt.sign({
            id: user.id,
            username: user.firstName,
            email: user.email,
        }, process.env.AWT_SECRET);
    };

}
