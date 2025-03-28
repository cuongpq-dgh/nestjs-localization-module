import { Column, CreateDateColumn, Entity, Generated, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('nlm_third_party_config')
export class ThirdPartyConfigEntity {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    code!: string;

    @Column()
    name!: string;

    @Column()
    type!: string;

    @Column()
    value!: string;

    @Column()
    group!: string;

    @CreateDateColumn()
    created_at!: Date;
    
    @UpdateDateColumn()
    updated_at!: Date;
}