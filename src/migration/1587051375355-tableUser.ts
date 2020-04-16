import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class tableUser1587051375355 implements MigrationInterface {
    table: "user";
    public async up(query: QueryRunner): Promise<any> {
        await query.createTable(new Table({name:"user", columns:[
                {
                    name: "id",
                    type: "int",
                    isNullable: false,
                    isGenerated: true,
                    isPrimary: true,
                },
                {
                    name: "first_name",
                    length: "200",
                    type: "varchar",
                    isNullable: false,
                },
                {
                    name: "last_name",
                    length: "200",
                    type: "varchar",
                    isNullable: false,
                },
                {
                    name: "password",
                    length: "200",
                    type: "varchar",
                    isNullable: false,
                },
                {
                    name: "phone",
                    length: "11",
                    type: "varchar",
                },
        ]}));
    }

    async down(query: QueryRunner): Promise<void> {
        return query.dropTable(this.table);
    }


}
