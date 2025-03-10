import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['lang', 'ns', 'key'])
export class Translation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  lang!: string;

  @Column({ default: 'translation' })
  ns!: string;

  @Column()
  key!: string;

  @Column()
  value!: string;
}
