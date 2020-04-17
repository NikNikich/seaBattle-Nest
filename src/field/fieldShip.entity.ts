import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";
import {UserEntity} from "../user/user.entity";
import {FieldEntity} from "./field.entity";
import {ShipEntity} from "../ship/ship.entity";

@Entity('field_ship')
export class FieldShipEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 100
    })
    coordinate: string;

    @Column()
    direction: number;


    @ManyToOne(type => FieldEntity, {eager: true, cascade: true})
    @JoinColumn({name: "field_id"})
    field: FieldEntity;

    @ManyToOne(type => ShipEntity, {eager: true, cascade: true})
    @JoinColumn({name: "ship_id"})
    ship: ShipEntity;
}