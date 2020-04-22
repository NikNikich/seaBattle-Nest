import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";
import {UserEntity} from "../user/user.entity";
import {GameEntity} from "../game/game.entity";

@Entity('field')
export class FieldEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 255
    })
    content: string;

    @Column({
        default:10
    })
    length:number;


}