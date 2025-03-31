import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index, AfterLoad } from 'typeorm';
import { TranslationEntity } from './translations.entity';

@Entity('languages')
export class LanguageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @Index() // Add index for faster code lookups
  code!: string;

  @Column()
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

  processTranslations?: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @AfterLoad()
  generateProcessedTranslations() {
    // compute translation percentage
    if (this.translations && this.translations.length > 0) {
      const total = this.translations.length;
      const translated = this.translations.filter(t => t.value).length;
      this.processTranslations = Math.floor((translated / total) * 100);
    } else {
      this.processTranslations = 0;
    }
  }
}

// Thêm export alias cho tương thích ngược
export { LanguageEntity as Language };