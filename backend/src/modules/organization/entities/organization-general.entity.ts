import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/base/base-entity.class';
import { City } from 'src/shared/entities/city.entity';
import { County } from 'src/shared/entities/county.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { ContactPerson } from '../interfaces/contact-person.interface';
import { OrganizationType } from '../enums/organization-type.enum';
import { Organization } from './organization.entity';
import { Issuer } from 'src/shared/entities';

@Entity()
export class OrganizationGeneral extends BaseEntity {
  @Column({ type: 'text', unique: true, name: 'name' })
  name: string;

  @Column({ type: 'text', unique: true, name: 'alias' })
  alias: string;

  @Column({ type: 'enum', enum: OrganizationType, name: 'type' })
  type: OrganizationType;

  @Column({ type: 'text', unique: true, name: 'email' })
  email: string;

  @Column({ type: 'text', unique: true, name: 'phone' })
  phone: string;

  @Column({ type: 'integer', name: 'year_created' })
  yearCreated: number;

  @Column({ type: 'text', name: 'cui', unique: true })
  cui: string;

  @Column({ type: 'text', name: 'association_registry_number', nullable: true })
  associationRegistryNumber: string;

  @Column({ type: 'text', name: 'association_registry_part', nullable: true })
  associationRegistryPart: string;

  @Column({
    type: 'text',
    name: 'association_registry_section',
    nullable: true,
  })
  associationRegistrySection: string;

  @Column({
    type: 'integer',
    name: 'association_registry_issuer_id',
    nullable: true,
  })
  associationRegistryIssuerId: number;

  @ManyToOne((type) => Issuer)
  @JoinColumn({ name: 'association_registry_issuer_id' })
  associationRegistryIssuer: Issuer;

  @Column({ type: 'text', name: 'national_registry_number', nullable: true })
  nationalRegistryNumber: string;

  @Column({ type: 'text', name: 'raf_number', unique: true, nullable: true })
  rafNumber: string;

  @Column({ type: 'text', name: 'short_description', nullable: true })
  shortDescription: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

  @Column({ type: 'text', name: 'address', nullable: true, default: '' })
  address: string;

  @Column({ type: 'text', name: 'logo', nullable: true })
  logo: string;

  @Column({ type: 'text', name: 'website', nullable: true })
  website: string;

  @Column({ type: 'text', name: 'facebook', nullable: true })
  facebook: string;

  @Column({ type: 'text', name: 'instagram', nullable: true })
  instagram: string;

  @Column({ type: 'text', name: 'twitter', nullable: true })
  twitter: string;

  @Column({ type: 'text', name: 'linkedin', nullable: true })
  linkedin: string;

  @Column({ type: 'text', name: 'tiktok', nullable: true })
  tiktok: string;

  @Column({ type: 'text', name: 'donation_website', nullable: true })
  donationWebsite: string;

  @Column({ type: 'text', name: 'redirect_link', nullable: true })
  redirectLink: string;

  @Column({ type: 'text', name: 'donation_sms', nullable: true })
  donationSMS: string;

  @Column({ type: 'text', name: 'donation_keyword', nullable: true })
  donationKeyword: string;

  @Column({ type: 'jsonb', name: 'contact_person' })
  contact: ContactPerson;

  @OneToOne(
    () => Organization,
    (organization) => organization.organizationGeneral,
    { onDelete: 'CASCADE' },
  )
  organization: Organization;

  @Exclude()
  @Column({ type: 'integer', nullable: true, name: 'city_id' })
  cityId: number;

  @ManyToOne((type) => City)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Exclude()
  @Column({ type: 'integer', nullable: true, name: 'county_id' })
  countyId: number;

  @ManyToOne((type) => County)
  @JoinColumn({ name: 'county_id' })
  county: County;

  @Column({ type: 'text', name: 'organization_address', nullable: true })
  organizationAddress: string;

  @Exclude()
  @Column({ type: 'integer', nullable: true, name: 'organization_city_id' })
  organizationCityId: number;

  @ManyToOne((type) => City)
  @JoinColumn({ name: 'organization_city_id' })
  organizationCity: City;

  @Exclude()
  @Column({ type: 'integer', nullable: true, name: 'organization_county_id' })
  organizationCountyId: number;

  @ManyToOne((type) => County)
  @JoinColumn({ name: 'organization_county_id' })
  organizationCounty: County;
}
