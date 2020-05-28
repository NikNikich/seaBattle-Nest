import {MigrationInterface, QueryRunner} from 'typeorm';

export class translateMigrationSeed1574686420185 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO \`user\` (\`first_name\`, \`last_name\`, \`email\`, \`password\`, \`phone\`)
            VALUES ('test1N', 'test1L', 'test@Test.test','test','1234567890')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
