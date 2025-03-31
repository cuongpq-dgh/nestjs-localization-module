import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('third_party_configs')
export class ThirdPartyConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  code!: string;

  @Column()
  provider!: string;

  @Column()
  value!: string;

  @Column({ nullable: true })
  region?: string
  
  @Column()
  type!: string;

  @Column()
  group!: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}

// Thêm export alias cho tương thích ngược
export { ThirdPartyConfigEntity as ThirdPartyConfig };