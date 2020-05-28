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
import {UserRepository} from "../src/user/user.repository";
import {DatabaseModule} from "../src/database/database.module";
const jwt = require('jsonwebtoken');

export const mockRepository = jest.fn(() => ({
    metadata: {
        columns: [],
        relations: [],
    },
}));

export const mockRepository1 = jest.fn(() => ({
    metadata: {
        columns: [],
        relations: [],
    },
}));


describe('User',  () => {
    let token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJOaWsiLCJlbWFpbCI6IjFAMi5ydSIsImlhdCI6MTU4ODI1ODY0Nn0.nzss5OYRO9xHGIvaXYOxFcso21qcrtNiHCfqBMs9Xlg';
    let app: INestApplication;
    let userRepository: UserRepository = null;
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
    postUser.password='test2test2';
    postUser.lastName='testL2322test2';
    postUser.firstName='testF2322test2';

    beforeAll(async () => {
         const module = await Test.createTestingModule({
             imports: [DatabaseModule, UserModule, UserRepository],
             controllers: [UserController],
             providers: [ {provide: getRepositoryToken(UserEntity), useClass: mockRepository }, {provide: getRepositoryToken(TokenEntity), useClass: mockRepository1 }]
      }).compile();
     app = module.createNestApplication();
     userRepository = app.get<UserRepository>(UserRepository);
     //   userRepository= null;
    // await userRepository.delete({});
        await app.init();
        });



    it(`/DELETE user`, () => {
        return  request(app.getHttpServer())
            .delete('/user')
            .send( {email:postUser.email}) // x-www-form-urlencoded upload
            ;
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
            .send({ email: putUser.email,password:putUser.password,firstName:putUser.firstName,lastName:putUser.lastName }) // x-www-form-urlencoded upload
            .set('authorization', token)
            .expect(200);

    });
    it(`/POST user`, () => {
        return request(app.getHttpServer())
            .post('/user')
            .send( {  email: postUser.email,password:postUser.password,firstName:postUser.firstName,lastName:putUser.lastName }) // x-www-form-urlencoded upload
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
            .send({ email: '11@1.13',password:'testikTextMessPut',firstName:'test1' }) // x-www-form-urlencoded upload
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