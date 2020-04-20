import {Entity, PrimaryGeneratedColumn, Column, BeforeInsert, JoinTable, ManyToMany, OneToMany} from "typeorm";
import { IsEmail,   } from 'class-validator';
import {TokenEntity} from "./token.entity";
import {GameEntity} from "../game/game.entity";

@Entity('user')
export class UserEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'first_name',
        length: 200
    })
    firstName: string;

    @Column({
        name: 'last_name',
        length: 200
    })
    lastName: string;

    @Column({
        length: 400
    })
    @IsEmail()
    email: string;

    @Column({
        length: 200
    })
    password: string;

    @Column({
        nullable: true
    })
    phone: number;

    @OneToMany(type => TokenEntity,token=>token.user,)
    token: TokenEntity[];

    @OneToMany(type => GameEntity,game=>[game.user1, game.user2],)
    game: GameEntity[];

}