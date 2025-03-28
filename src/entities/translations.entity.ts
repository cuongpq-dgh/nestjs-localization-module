import { Entity, Column, PrimaryColumn, Unique, BeforeInsert, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ShortUUID } from '../utils/short-uuid.util';
import { LanguageEntity } from './language.entity';
import { CategoryEntity } from './category.entity';

@Entity('nlm_translations')
@Unique(['lang', 'ns', 'key'])
@Index(['lang', 'ns']) // Add composite index for frequent language+namespace queries
@Index(['categoryId']) // Add index for category filtering
export class TranslationEntity {
  @PrimaryColumn({ length: 22 })
  id!: string;

  @Column({ default: 'translation' })
  ns!: string;

  @Column()
  key!: string;

  @Column ({ nullable: true })
  value?: string;

  @Column({ nullable: true, length: 22 })
  categoryId?: string;

  @ManyToOne(() => LanguageEntity, language => language.translations)
  @JoinColumn({ name: 'lang', referencedColumnName: 'code' })
  lang!: LanguageEntity;

  @ManyToOne(() => CategoryEntity, category => category.translations, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category?: CategoryEntity;

  @BeforeInsert()
  generateId() {
    // Generate a short UUID (22 chars) for new records if id is not set
    if (!this.id) {
      this.id = ShortUUID.generate();
    }
  }
}
