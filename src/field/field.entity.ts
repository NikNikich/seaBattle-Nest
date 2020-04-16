import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";
import {UserEntity} from "../user/user.entity";
import {GameEntity} from "../Game/game.entity";

@Entity('field')
export class FieldEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 255
    })
    content: string;

    @Column({
        length: 3
    })
    length:number;

    @ManyToOne(type => GameEntity, {eager: true, cascade: true})
    @JoinColumn({name: "game_id"})
    game: GameEntity;

}