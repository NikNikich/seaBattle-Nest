import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn, OneToMany
} from "typeorm";
import {UserEntity} from "../user/user.entity";
import {FieldEntity} from "../field/field.entity";
import {UserGameEntity} from "./userGame.entity";

@Entity('game')
export class GameEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: true
    })
    winner:number;

    @Column({
        default:0,
        nullable: true
    })
    progress:number;

    @Column({
        name:"user2_id",
        nullable: true
    })
    user2Id:number;

    @Column({
        name:"walking",
        nullable: true
    })
    walkingId:number;

    @Column({
        default:false,
        nullable: true
    })
   start:boolean;

    @Column({
        default:null,
        nullable: true
    })
    level:number;


    @ManyToOne(type => UserEntity,{  eager: true, cascade:true})
    @JoinColumn({ name: "walking", })
    walking: UserEntity;

    @ManyToOne(type => UserEntity,{  eager: true, cascade:true})
    @JoinColumn({ name: "user1_id" })
    user1: UserEntity;

    @ManyToOne(type => UserEntity,{  eager: true, cascade:true})
    @JoinColumn({ name: "user2_id" })
    user2: UserEntity;

    @OneToMany(type => UserGameEntity,userGame=>userGame.game,)
    userGame: FieldEntity[];

}