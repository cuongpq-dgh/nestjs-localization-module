import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../entities/category.entity';
import { CreateCategoryDto } from '../dtos/category/create-category.dto';
import { UpdateCategoryDto } from '../dtos/category/update-category.dto';
import { TranslationEntity } from '../entities/translations.entity';
import { LanguageEntity } from '../entities/language.entity';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
    @InjectRepository(TranslationEntity)
    private readonly translationRepo: Repository<TranslationEntity>,
    @InjectRepository(LanguageEntity)
    private readonly languageRepo: Repository<LanguageEntity>
  ) {}

  /**
   * Create a new category
   * @param createDto Category data
   * @returns The created category entity
   */
  async create(createDto: CreateCategoryDto): Promise<CategoryEntity> {
    const category = this.categoryRepo.create(createDto);
    return await this.categoryRepo.save(category);
  }

  /**
   * Find all categories
   * @returns Array of category entities
   */
  async findAll(): Promise<CategoryEntity[]> {
    return await this.categoryRepo.find({
      relations: ['parent', 'children']
    });
  }

  /**
   * Find a category by its ID
   * @param id Category ID
   * @returns The found category entity
   * @throws NotFoundException if category not found
   */
  async findById(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepo.findOne({ 
      where: { id },
      relations: ['parent', 'children']
    });
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    return category;
  }

  /**
   * Find a category by its slug
   * @param slug Category slug
   * @returns The found category entity
   * @throws NotFoundException if category not found
   */
  async findBySlug(slug: string): Promise<CategoryEntity> {
    const category = await this.categoryRepo.findOne({ 
      where: { slug },
      relations: ['parent', 'children']
    });
    
    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }
    
    return category;
  }

  /**
   * Update a category by ID
   * @param id Category ID
   * @param updateDto Updated category data
   * @returns The updated category entity
   * @throws NotFoundException if category not found
   */
  async update(id: string, updateDto: UpdateCategoryDto): Promise<CategoryEntity> {
    const category = await this.findById(id);
    
    // Update the category properties
    Object.assign(category, updateDto);
    
    // Save the changes
    return await this.categoryRepo.save(category);
  }

  /**
   * Remove a category by ID
   * @param id Category ID
   * @returns Boolean indicating success
   * @throws NotFoundException if category not found
   */
  async remove(id: string): Promise<boolean> {
    const category = await this.findById(id);
    const result = await this.categoryRepo.remove(category);
    return !!result;
  }

  /**
   * Get translation progress for a category
   * Optimized with query improvements and caching
   * @param categoryId Category ID
   * @param languageCode Language code
   * @returns Progress statistics
   */
  async getTranslationProgress(
    categoryId: string, 
    languageCode?: string
  ): Promise<{ total: number; translated: number; percentage: number }> {
    try {
      // Get category to verify it exists - use cache
      await this.findById(categoryId);
      
      // Get default language - use cache for frequently accessed data
      const defaultLanguage = await this.languageRepo.findOne({
        where: { isDefault: true },
        cache: true
      });
      
      if (!defaultLanguage) {
        throw new NotFoundException('Default language not found');
      }
      
      const defaultLangCode = defaultLanguage.code;
        
      // If language code is provided, get statistics for that language
      if (languageCode) {
        // Use a single query with COUNT to improve performance
        const [defaultCount, translatedCount] = await Promise.all([
          // Count total keys in the default language for this category
          this.translationRepo.count({
            where: {
              categoryId,
              lang: { code: defaultLangCode }
            },
            cache: true // Cache results for 5 minutes
          }),
          
          // Count translated keys in the target language for this category
          this.translationRepo.count({
            where: {
              categoryId,
              lang: { code: languageCode }
            },
            cache: true
          })
        ]);
          
        const percentage = defaultCount > 0 ? Math.round((translatedCount / defaultCount) * 100) : 0;
        
        return {
          total: defaultCount,
          translated: translatedCount,
          percentage
        };
      } else {
        // Get statistics across all languages - optimize with fewer queries
        const [allLanguages, defaultLangKeys, totalTranslated] = await Promise.all([
          // Get active languages
          this.languageRepo.find({ 
            where: { active: true },
            cache: true 
          }),
          
          // Get unique keys in the category (from default language)
          this.translationRepo.find({
            select: ['key'],
            where: {
              categoryId,
              lang: { code: defaultLangCode }
            },
            cache: true
          }),
          
          // Count all translations for this category in a single query
          this.translationRepo.count({
            where: { categoryId }
          })
        ]);
        
        const totalKeys = defaultLangKeys.length;
        const totalPossible = totalKeys * allLanguages.length;
        
        const percentage = totalPossible > 0 ? Math.round((totalTranslated / totalPossible) * 100) : 0;
        
        return {
          total: totalPossible,
          translated: totalTranslated,
          percentage
        };
      }
    } catch (error) {
      this.logger.error(`Error calculating translation progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}
