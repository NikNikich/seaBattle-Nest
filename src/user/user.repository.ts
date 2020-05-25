import {UserEntity} from './user.entity';
import {EntityRepository, FindOneOptions, Not, Repository} from 'typeorm';
import {BaseRepository} from "typeorm-transactional-cls-hooked";

@EntityRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {

}
