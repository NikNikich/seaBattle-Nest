import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn, OneToOne
} from "typeorm";
import {UserEntity} from "../user/user.entity";
import {FieldEntity} from "../field/field.entity";
import {GameEntity} from "./game.entity";

@Entity('user_game')
export class UserGameEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'sunk_ships',
        default:0
    })
    sunkShips:number;


    @Column({
        name:"game_field",
        nullable: true
    })
    gameFieldId:number;

    @Column({
        name:"his_field",
        nullable: true
    })
    hisFieldId:number;

    @OneToOne(type => FieldEntity,{  eager: true, cascade:true})
    @JoinColumn({ name: "game_field" })
    gameField: FieldEntity;

    @OneToOne(type => FieldEntity,{  eager: true, cascade:true})
    @JoinColumn({ name: "his_field" })
    hisField: FieldEntity;

    @ManyToOne(type => UserEntity,{  eager: true, cascade:true})
    @JoinColumn({ name: "user_id" })
    user: UserEntity;

    @ManyToOne(type => GameEntity, {eager: true, cascade: true})
    @JoinColumn({name: "game_id"})
    game: GameEntity;

}