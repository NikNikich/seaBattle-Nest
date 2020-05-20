import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { UserModule } from '../src/user/user.module';
import { UserEntity } from '../src/user/user.entity';
import { INestApplication } from '@nestjs/common';
import {TypeOrmModule, getRepositoryToken, getCustomRepositoryToken} from "@nestjs/typeorm";
import {ConfigModule} from "@nestjs/config";
import {
    Repository,
    getRepository,
    DeleteResult,
    getCustomRepository,
    getConnectionOptions,
    createConnection
} from "typeorm";
import {TokenEntity} from "../src/user/token.entity";
import {GameModule} from "../src/game/game.module";
import {AppController} from "../src/app.controller";
import {AppService} from "../src/app.service";
import {UserController} from "../src/user/user.controller";
import {UserService} from "../src/user/user.service";
import {asyncScheduler} from "rxjs";
const jwt = require('jsonwebtoken');

export const mockRepository = jest.fn(() => ({
    metadata: {
        columns: [],
        relations: [],
    },
}));


describe('User',  () => {
    let token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJkZmdkZmdmc2RmcyIsImVtYWlsIjoiMzRAMzQudmNiYyIsImlhdCI6MTU3OTc4MTUxNn0.faoJPvnqjet0iTPr8Na3KGZvTCfdXY8F1_wlfUlHCAc';
    let app: INestApplication;
 //   const userEntityRepository = getCustomRepository(UserEntity);
   // const connection =  () => {return await createConnection(await getConnectionOptions())};
    let findUser = new UserEntity();
    findUser.firstName = 'testF1';
    findUser.lastName = 'testL1';
    findUser.email = '11@12.133';
    findUser.password = '34@35.vcbc';
    let getUser = new UserEntity();
    getUser.firstName = 'testF1';
    getUser.lastName = 'testL1';
    getUser.email = '11@12.133';
    getUser.password = '34@35.vcbc';
    let putUser = new UserEntity();
    putUser.email='11@12.133';
    putUser.password='testikTextMessPut';
    putUser.firstName='testF122';
    putUser.lastName='testL122';
    let postUser = new UserEntity();
    postUser.email='test11231@test.test';
    postUser.password='test22test2';
    postUser.lastName='testL2322test2';
    postUser.firstName='testF2322test2';
     let userService = { findAll: () => ['test'],
         findOne: () => { return {
             "id":1,
             "email": "1@2.ru",
          //   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiIxQDIucnUiLCJlbWFpbCI6IjFAMi5ydSIsImlhdCI6MTU3OTg2NTc5MH0.UK9ZqBjNkLTrMBqBj2q90zShp1WZtBMKilqb8DQNh-k",
             "name": "1@2.ru"
         } },
        update: () => { return{
            "id": 3,
                "name": "nov11",
                "email": "74741",
                "password": "nov21"
        }},
         create:()=>['User Save']
     };
  //  let userService: UserService;

    beforeAll(async () => {
        const connection =  await createConnection(await getConnectionOptions());
        const module = await Test.createTestingModule({
            controllers: [UserController],
            providers: [UserService],
            imports:[TypeOrmModule.forFeature([UserEntity,TokenEntity], {
                "type": "postgres",
                "host": "localhost",
                "port": 5432,
                "username": "postgres",
                "password": "postgres",
                "database": "sea",
                "synchronize": true,
                "entities": ["dist/**/*.entity.js"],
                "cli": {
                    "migrationsDir": "src/migration"
                },
                "migrations": ["src/migration/*.ts"]
            }),UserModule]
       //     imports: [TypeOrmModule.forFeature([UserEntity,TokenEntity]),  UserModule, UserEntity, TokenEntity, ConfigModule.forRoot()],
          //  providers:[{provide:getRepositoryToken(UserEntity)}
        }).compile();

        app = module.createNestApplication();
        await app.init();
        });



    it(`/GET user`, () => {
           return  request(app.getHttpServer())
            .get('/user')
            .send( 'email= '+getUser.email) // x-www-form-urlencoded upload
            .send( 'password= '+getUser.password) // x-www-form-urlencoded upload
            .expect(200)
            ;
    });
    it(`/PUT user`, () => {
       return  request(app.getHttpServer())
            .put('/user')
            .send({ email: putUser.email,password:putUser.password,name:putUser.firstName }) // x-www-form-urlencoded upload
            .set('authorization', token)
            .expect(200);

    });
    it(`/POST user`, () => {
        return request(app.getHttpServer())
            .post('/user')
            .send( {  email: postUser.email,password:postUser.password,name:postUser.firstName }) // x-www-form-urlencoded upload
            .expect(200);
    });
    it(`/GET user no`, () => {
        return request(app.getHttpServer())
            .get('/user')
            .send( 'email= 34@35.vcbc') // x-www-form-urlencoded upload
            .expect(200,'Not Found');
    });
    it(`/PUT user  no`, () => {
        return request(app.getHttpServer())
            .put('/user')
            .send({ email: '11@1.13',password:'testikTextMessPut',name:'test1' }) // x-www-form-urlencoded upload
            .set('authorization', 'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJkZmdkZmdmc2RmcyIsImVtYWlsIjoiMzRAMzQudmNiYyIsImlhdCI6MTU3OTc4MTUxNn0.faoJPvnqjet0iTPr8Na3KGZvTCfdXY8F1_wlfUlHCAc')
            .expect(400)
            ;
    });
    it(`/POST user  no`, () => {
        return request(app.getHttpServer())
            .post('/user')
            .send({ password:'test1test1no' }) // x-www-form-urlencoded upload
            .expect(400)
           ;
    });

    afterAll(async () => {
        await app.close();
    });
});