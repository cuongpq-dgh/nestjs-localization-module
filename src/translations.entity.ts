import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['lang', 'key'])
export class Translation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  lang!: string;

  @Column()
  key!: string;

  @Column()
  value!: string;
}
