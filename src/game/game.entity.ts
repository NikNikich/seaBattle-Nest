import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn, OneToMany
} from "typeorm";
import {UserEntity} from "../user/user.entity";
import {FieldEntity} from "../field/field.entity";

@Entity('game')
export class GameEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    winner:number;

    @Column()
    progress:number;

    @ManyToOne(type => UserEntity,{  eager: true, cascade:true})
    @JoinColumn({ name: "walking" })
    walking: UserEntity;

    @ManyToOne(type => UserEntity,{  eager: true, cascade:true})
    @JoinColumn({ name: "user1_id" })
    user1: UserEntity;

    @ManyToOne(type => UserEntity,{  eager: true, cascade:true})
    @JoinColumn({ name: "user2_id" })
    user2: UserEntity;

    @OneToMany(type => FieldEntity,field=>field.game,)
    field: FieldEntity[];

}