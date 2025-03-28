import { Entity, Column, PrimaryColumn, BeforeInsert, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ShortUUID } from '../utils/short-uuid.util';
import { TranslationEntity } from './translations.entity';

@Entity('nlm_categories')
export class CategoryEntity {
  @PrimaryColumn({ length: 22 })
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ nullable: true, length: 255 })
  description?: string;

  @Column({ length: 100, unique: true })
  @Index() // Add index for faster slug lookups
  slug!: string;

  @Column({ nullable: true, length: 22 })
  @Index() // Add index for parent-child relationship lookups
  parentId?: string;

  @ManyToOne(() => CategoryEntity, category => category.children)
  @JoinColumn({ name: 'parentId' })
  parent?: CategoryEntity;

  @OneToMany(() => CategoryEntity, category => category.parent)
  children?: CategoryEntity[];

  @OneToMany(() => TranslationEntity, translation => translation.category)
  translations?: TranslationEntity[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = ShortUUID.generate();
    }
  }
}
