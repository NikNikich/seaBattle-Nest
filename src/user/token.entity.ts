import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "./user.entity";

@Entity('token')
export class TokenEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 200
    })
    firstName: string;

    @ManyToOne(type => UserEntity,{  eager: true, cascade:true})
    @JoinColumn({ name: "user_id" })
    user: UserEntity;

}
