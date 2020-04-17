import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn, OneToOne
} from "typeorm";
import {UserEntity} from "../user/user.entity";
import {FieldEntity} from "../field/field.entity";

@Entity('user_game')
export class UserGame {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'sunk_ships'
    })
    sunkShips:number;

    @Column()
    progress:number;

    @OneToOne(type => FieldEntity,{  eager: true, cascade:true})
    @JoinColumn({ name: "game_field" })
    gameField: FieldEntity;

    @OneToOne(type => FieldEntity,{  eager: true, cascade:true})
    @JoinColumn({ name: "his_field" })
    hisField: FieldEntity;

    @ManyToOne(type => UserEntity,{  eager: true, cascade:true})
    @JoinColumn({ name: "user_id" })
    user: UserEntity;

}