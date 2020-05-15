import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { UserModule } from '../src/user/user.module';
import { UserEntity } from '../src/user/user.entity';
import { INestApplication } from '@nestjs/common';
import {TypeOrmModule, getRepositoryToken} from "@nestjs/typeorm";
import {ConfigModule} from "@nestjs/config";
import {Repository, getRepository, DeleteResult } from "typeorm";
import {TokenEntity} from "../src/user/token.entity";
import {GameModule} from "../src/game/game.module";
import {AppController} from "../src/app.controller";
import {AppService} from "../src/app.service";
const jwt = require('jsonwebtoken');

export const mockRepository = jest.fn(() => ({
    metadata: {
        columns: [],
        relations: [],
    },
}));

describe('User', () => {
    let token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJkZmdkZmdmc2RmcyIsImVtYWlsIjoiMzRAMzQudmNiYyIsImlhdCI6MTU3OTc4MTUxNn0.faoJPvnqjet0iTPr8Na3KGZvTCfdXY8F1_wlfUlHCAc';
    let app: INestApplication;
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
        const module = await Test.createTestingModule({
         //   imports: [TypeOrmModule.forRoot({
            //         type: "sqlite",
            //         database: ":memory:",
            //         dropSchema: true,
            //         entities: [CompanyInfo],
            //         synchronize: true,
            //         logging: false,
            //     }),TypeOrmModule.forFeature([UserEntity])],
          /*  imports: [
                UserModule,
           //     GameModule,
                TypeOrmModule.forRoot(),
                ConfigModule.forRoot()
            ],
            controllers: [AppController],
            providers: [AppService,{ provide: getRepositoryToken(UserEntity), useClass: mockRepository }],*/
            imports: [TypeOrmModule.forFeature([UserEntity,TokenEntity]),TypeOrmModule.forRoot(),  UserModule,  ConfigModule.forRoot()],
            providers: [AppService, UserEntity],
          //  providers: [{ provide: getRepositoryToken(UserEntity), useClass: mockRepository }],
         //   controllers: [
         //       UserController
         //   ],
        //    exports: [UserService]
        })
       /*     .overrideProvider(getRepositoryToken(UserEntity))
            .useValue({
                getRepository: () => findUser,
                find: () => findUser,
                findOne: () => findUser,
                getOne: () => undefined,
                save: () => findUser,
                createQueryBuilder:()=>findUser,
                where: () => findUser,
                orWhere: () => findUser,
                validate: () => undefined,

            })*/
            // .overrideProvider(UserService)
            // .useValue(userService)
            .compile();

        app = module.createNestApplication();

       // userService = app.get(UserService);

        await app.init();
       /* let userEntity = await getRepository(UserEntity);
        try {
            await  userEntity.delete(postUser);
        } catch (e) {
            console.log('Упс пут юзера таки и не было');
        }
        try {
            await  userEntity.delete(postUser);
        } catch (e) {
            console.log('Упс пост юзера таки и не было');
        }
        try {
            await  userEntity.save(getUser);
        } catch (e) {
            console.log('Упс есть уже гетованный товарищщ');
        }
        let userFind=await userEntity.createQueryBuilder('user')
            .where('user.email = :email', { email:getUser.email })
            .getOne();
      //  const user = await qb.getOne();.findOne({email:getUser.email,password:getUser.password});
        if (userFind) {
            token = jwt.sign({
                id: userFind.id,
                username: userFind.name,
                email: userFind.email,
            }, process.env.AWT_SECRET);
        }*/
        });



    it(`/GET user`, () => {
        return request(app.getHttpServer())
            .get('/user')
            .send( 'email= '+getUser.email) // x-www-form-urlencoded upload
            .send( 'password= '+getUser.password) // x-www-form-urlencoded upload
            .expect(200)
          /*  .expect({
                data: userService.findOne(),
            })*/;
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
          //  .send( 'password= 34@35.vcbc') // x-www-form-urlencoded upload
            .expect(200,'Not Found');
    });
    it(`/PUT user  no`, () => {
        return request(app.getHttpServer())
            .put('/user')
            .send({ email: '11@1.13',password:'testikTextMessPut',name:'test1' }) // x-www-form-urlencoded upload
            .set('authorization', 'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJkZmdkZmdmc2RmcyIsImVtYWlsIjoiMzRAMzQudmNiYyIsImlhdCI6MTU3OTc4MTUxNn0.faoJPvnqjet0iTPr8Na3KGZvTCfdXY8F1_wlfUlHCAc')
            .expect(400)
            /*.expect({
                data: userService.findAll(),
            })*/;
    });
    it(`/POST user  no`, () => {
        return request(app.getHttpServer())
            .post('/user')
            .send({ password:'test1test1no' }) // x-www-form-urlencoded upload
            .expect(400)
           /* .expect({
                data: userService.findAll(),
            })*/;
    });

    afterAll(async () => {
        await app.close();
    });
});