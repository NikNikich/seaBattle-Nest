import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
//import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './dto';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "./user.entity";
import {TokenEntity} from "./token.entity";
class UserService {
    constructor(
        private readonly userRepository: any
    ) {}

    async create(dto: CreateUserDto){
        return 'test';
    }
    async findOne( loginUserDto: LoginUserDto){
        return 'test';
    }
    async update(dto: UpdateUserDto){
        return 'test';
    }
}
describe('UserController', () => {
    let userController: UserController;
    let userService: UserService;
    let createUserDto:CreateUserDto={firstName:'Test',lastName:'Testovich',email:'test@1.ru',password:'pass1', phone:'123456789'};
    let updateUserDto:UpdateUserDto={firstName:'TestU',lastName:'TestovichU',email:'test@1U.ru', id:'0'};
    const result = 'test';
    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [UserService],
        }).compile();

        userController = app.get<UserController>(UserController);
        userService = app.get<UserService>(UserService);

    });

    describe('root', () => {
        it('create return "test"', async () => {
            console.log(userService);
            const testProm = () => new Promise((resolve, reject) => result);
            let  data= await userService.create(createUserDto);
            expect(data).toBe(result);
        });
        it('update return "test"', async () => {
            let  data= await userController.update(updateUserDto);
            expect(data).toBe(result);
        });
        it('findOne return "test"', async () => {
            let  data= await userController.findOne('test@1.ru','pass1');
            expect(data).toBe(result);
        });
    });
});
