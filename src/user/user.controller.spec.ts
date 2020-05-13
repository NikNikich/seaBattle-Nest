import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from '../dto';
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
    let createUserDto:CreateUserDto={name:'Nik',email:'test@1.ru',password:'pass1'};
    let updateUserDto:UpdateUserDto={name:'Nik',email:'test@1.ru',id:'0'};
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
            const testProm = () => new Promise((resolve, reject) => result);
            let  data= await userController.create(createUserDto);
            console.log('data create '+data);
            expect(data).toBe(result);
        });
        it('update return "test"', async () => {
            let  data= await userController.update(updateUserDto);
            console.log('data upd '+data);
            expect(data).toBe(result);
        });
        it('findOne return "test"', async () => {
            let  data= await userController.findOne('test@1.ru','pass1');
            console.log('data find '+data);
            expect(data).toBe(result);
        });
    });
});
