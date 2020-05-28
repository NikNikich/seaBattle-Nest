import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {getCustomRepositoryToken, InjectRepository} from '@nestjs/typeorm';
import {
    Repository,
    getRepository,
    DeleteResult,
    EntityManager,
    getCustomRepository,
    getConnection,
    getConnectionManager, getTreeRepository
} from 'typeorm';
import { UserEntity } from './user.entity';
import {CreateUserDto, LoginUserDto, UpdateUserDto} from './dto';
import {validate} from "class-validator";
import {TokenEntity} from "./token.entity";
import {ConfigService} from "@nestjs/config";
const jwt = require('jsonwebtoken');

@Injectable()
export class UserService {
    constructor(
 /*       @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(TokenEntity)
        private readonly tokenRepository: Repository<TokenEntity>*/
    ) {}
   // private readonly connection= getConnectionManager().get();
   // private readonly userRepository= getRepository(UserEntity);
   // private readonly tokenRepository= getRepository(TokenEntity);
    private readonly secret= 'secret'

    async findAll(): Promise<UserEntity[]> {
        const userRepository= getRepository(UserEntity);
        return await userRepository.find();
    }

    async findOne(loginUserDto: LoginUserDto) {
        const userRepository= getRepository(UserEntity);
        const tokenRepository= getRepository(TokenEntity);
        const findOneOptions = {
            email: loginUserDto.email,
            password:  loginUserDto.password,
        };
        let userFind=await userRepository.findOne(findOneOptions);

        if (userFind) {
            console.log(`findOne ${userFind.id}`);
            const token = await tokenRepository.findOne({user:userFind});
            const {email, firstName, lastName} = userFind;
            return {email, token, firstName, lastName};
        } else return "Not Found";
    }

    async create(dto: CreateUserDto):Promise<any>{
        const userRepository= getRepository(UserEntity);
        const tokenRepository= getRepository(TokenEntity);
        const {lastName, firstName, email, password, phone} = dto;
        const user = await userRepository.findOne({email});
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
        const errors = await validate(newUser);
        if (errors.length > 0) {
            console.log(`err1`);
            const _errors = {username: 'User input is not valid.',errors:errors};
            throw new HttpException({message: 'Input data validation failed', _errors}, HttpStatus.BAD_REQUEST);

        } else {
     //       let newToken = new TokenEntity();
            const savedUser = await userRepository.save(newUser);
            const token = await this.generateJWT(newUser);
            await tokenRepository.save({user:savedUser, accessToken:token });
            return "user Save";
        }

    }

    async update( dto: UpdateUserDto): Promise<UserEntity> {
        console.log(dto);
        const userRepository= getRepository(UserEntity);
        let toUpdate = await userRepository.findOne(dto.id);

        let updated = Object.assign(toUpdate, dto);
        return await userRepository.save(updated);
    }

    async delete(email: string): Promise<DeleteResult> {
        const userRepository= getRepository(UserEntity);
        const tokenRepository= getRepository(TokenEntity);
        const user = await userRepository.findOne({email});
        console.log(email);
        if (user){
            await tokenRepository.delete({user:user});
            return await userRepository.delete({ email: email});
        }
        throw new HttpException({message: 'This user does not exist '}, HttpStatus.BAD_REQUEST);
    }

    public generateJWT(user) {
        //let today = new Date();
        //let exp = new Date(today);
        //exp.setDate(today.getDate() + 60);
        return jwt.sign({
            id: user.id,
            username: user.firstName,
            email: user.email,
        }, this.secret);
    };

}
