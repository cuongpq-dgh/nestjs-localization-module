import { Entity, Column, PrimaryColumn, BeforeInsert, OneToMany, Index } from 'typeorm';
import { ShortUUID } from '../utils/short-uuid.util';
import { TranslationEntity } from './translations.entity';

@Entity('nlm_languages')
export class LanguageEntity {
  @PrimaryColumn({ length: 22 })
  id!: string;

  @Column({ length: 10, unique: true })
  @Index() // Add index for faster code lookups
  code!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ default: true })
  @Index() // Add index for active language filtering
  active!: boolean;

  @Column({ default: false })
  @Index() // Add index for default language lookups
  isDefault!: boolean;

  @Column({ nullable: true })
  flagIcon?: string;

  @OneToMany(() => TranslationEntity, translation => translation.lang)
  translations?: TranslationEntity[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = ShortUUID.generate();
    }
  }
}