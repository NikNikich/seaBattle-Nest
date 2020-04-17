import {Entity, PrimaryGeneratedColumn, Column, BeforeInsert, JoinTable, ManyToMany, OneToMany} from "typeorm";

@Entity('ship')
export class ShipEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 200
    })
    title: string;

    @Column()
    length: number;

}