import { Entity, Column, PrimaryColumn, Unique, BeforeInsert, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ShortUUID } from '../utils/short-uuid.util';
import { Language, LanguageEntity } from './language.entity';
@Entity('nlm_translations')
@Unique(['lang', 'ns', 'key'])
@Index(['lang', 'ns']) // Add composite index for frequent language+namespace queries
export class TranslationEntity {
  @PrimaryColumn({ length: 22 })
  id!: string;

  @Column({ default: 'translation' })
  ns!: string;

  @Column()
  key!: string;

  @Column ({ nullable: true })
  value?: string;

  @ManyToOne(() => LanguageEntity, language => language.translations)
  @JoinColumn({ name: 'lang', referencedColumnName: 'code' })
  lang!: LanguageEntity;

  @BeforeInsert()
  generateId() {
    // Generate a short UUID (22 chars) for new records if id is not set
    if (!this.id) {
      this.id = ShortUUID.generate();
    }
  }
}
