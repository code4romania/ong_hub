import { Exclude } from 'class-transformer';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Exclude()
  @DeleteDateColumn({
    name: 'deleted_on',
    type: 'timestamp with time zone',
    select: false,
  })
  deletedOn: Date;

  @Index()
  @CreateDateColumn({ name: 'created_on', type: 'timestamp with time zone' })
  createdOn: Date;

  @UpdateDateColumn({
    name: 'updated_on',
    type: 'timestamp with time zone',
  })
  updatedOn: Date;
}
