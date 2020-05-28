import {getRepository, MigrationInterface, QueryRunner} from 'typeorm';
import {UserEntity} from "../../user/user.entity";
import {UserService} from "../../user/user.service";

export class translateMigrationSeed1574686420185 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const userRepository= getRepository(UserEntity);
        let user = await userRepository.findOne({email:'test@Test.test'});
      /*  const user = new UserEntity();
        user.lastName = 'test1N';
        user.firstName = 'test1L';
        user.email = 'test@Test.test';
        user.password = 'test';
        user.phone = 'test';*/
        const userService= new UserService;
        const token= userService.generateJWT(user)
        await queryRunner.query(`
            INSERT INTO \`token\` (\`access_token\`, \`user_id\`)
            VALUES (`+token+`,`+user.id+`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
