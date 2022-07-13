import { OrganizationLegal } from 'src/modules/organization/entities';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base/base-entity.class';

@Entity({ name: '_contact' })
export class Contact extends BaseEntity {
  @Column({ type: 'text', name: 'full_name' })
  fullName: string;

  @Column({ type: 'text', name: 'email', unique: true })
  email: string;

  @Column({ type: 'text', name: 'phone' })
  phone: string;

  @ManyToOne(
    () => OrganizationLegal,
    (organizationLegal) => organizationLegal.directors,
  )
  organizationLegal: OrganizationLegal;
}
