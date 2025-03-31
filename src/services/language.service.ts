import { Injectable, NotFoundException, Logger, Inject, Optional } from "@nestjs/common";
import { Not, Repository } from "typeorm";
import { LanguageEntity } from "../entities/language.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateLanguageDto } from "../dtos/language/create-language.dto";
import { UpdateLanguageDto } from "../dtos/language/update-language.dto";
import { CONNECTION_NAME_TOKEN } from '../module/translations.module';

@Injectable()
export class LanguageService {
    private readonly logger = new Logger(LanguageService.name);
    private cachedDefaultLanguage: LanguageEntity | null = null;
    private defaultLanguageCacheTime: number = 0;
    private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour cache

    constructor(
        @InjectRepository(LanguageEntity)
        private readonly languageRepo: Repository<LanguageEntity>,
        @Optional() @Inject(CONNECTION_NAME_TOKEN) private readonly connectionName?: string,
    ) {}

    /**
     * Create a new language
     * @param createDto Language data
     * @returns The created language entity
     */
    async create(createDto: CreateLanguageDto): Promise<LanguageEntity> {
        const language = this.languageRepo.create(createDto);
        
        // If setting as default, update other languages
        if (createDto.isDefault) {
            await this.languageRepo.update({ isDefault: true }, { isDefault: false });
        }
        
        const result = await this.languageRepo.save(language);
        
        // Clear the default language cache if the new language is set as default
        if (createDto.isDefault) {
            this.invalidateDefaultLanguageCache();
        }
        
        return result;
    }

    /**
     * Find all languages
     * @param active Optional filter for active languages
     * @returns Array of language entities
     */
    async findAll(active?: boolean): Promise<LanguageEntity[]> {
        const queryBuilder = this.languageRepo.createQueryBuilder('language');
        
        if (active !== undefined) {
            queryBuilder.where('language.active = :active', { active });
        }
        
        // Add cache for frequently used queries
        queryBuilder.cache(true);
        
        return await queryBuilder.getMany();
    }

    /**
     * Find a language by its ID
     * @param id Language ID
     * @returns The found language entity
     * @throws NotFoundException if language not found
     */
    async findById(id: string): Promise<LanguageEntity> {
        const language = await this.languageRepo.findOne({ 
            where: { id },
            cache: true // Cache this query for better performance
        });
        
        if (!language) {
            throw new NotFoundException(`Language with ID ${id} not found`);
        }
        
        return language;
    }

    /**
     * Find a language by its code
     * @param code Language code (e.g., 'en', 'fr')
     * @returns The found language entity
     * @throws NotFoundException if language not found
     */
    async findByCode(code: string): Promise<LanguageEntity> {
        const language = await this.languageRepo.findOne({ 
            where: { code },
            cache: true // Cache this query for better performance
        });
        
        if (!language) {
            throw new NotFoundException(`Language with code ${code} not found`);
        }
        
        return language;
    }

    /**
     * Update a language by ID
     * @param id Language ID
     * @param updateDto Updated language data
     * @returns The updated language entity
     * @throws NotFoundException if language not found
     */
    async update(id: string, updateDto: UpdateLanguageDto): Promise<LanguageEntity> {
        const language = await this.findById(id);
        
        const wasDefault = language.isDefault;
        const willBeDefault = updateDto.isDefault !== undefined ? updateDto.isDefault : wasDefault;
        
        // Handle default language changes
        if (!wasDefault && willBeDefault) {
            // This language is becoming the default, remove default from others
            await this.languageRepo.update({ isDefault: true }, { isDefault: false });
        } else if (wasDefault && !willBeDefault) {
            // This language is no longer the default, but we need at least one default language
            const count = await this.languageRepo.count();
            if (count <= 1) {
                // Don't allow removing default status if this is the only language
                updateDto.isDefault = true;
            }
        }
        
        // Update the language properties
        Object.assign(language, updateDto);
        
        // Save the changes
        const result = await this.languageRepo.save(language);
        
        // Invalidate cache if default status changed
        if (wasDefault !== willBeDefault) {
            this.invalidateDefaultLanguageCache();
        }
        
        return result;
    }

    /**
     * Delete a language by ID
     * @param id Language ID
     * @returns Boolean indicating success
     * @throws NotFoundException if language not found
     */
    async remove(id: string): Promise<boolean> {
        const language = await this.findById(id);
        
        // Prevent deletion of the default language if it's the only one
        if (language.isDefault) {
            const count = await this.languageRepo.count();
            if (count <= 1) {
                throw new Error('Cannot delete the only language in the system');
            }
            
            // If deleting the default language, need to set another one as default
            const newDefault = await this.languageRepo.findOne({
                where: { id: Not(id), active: true }
            });
            
            if (newDefault) {
                newDefault.isDefault = true;
                await this.languageRepo.save(newDefault);
            }
            
            // Invalidate cache
            this.invalidateDefaultLanguageCache();
        }
        
        const result = await this.languageRepo.remove(language);
        return !!result;
    }

    /**
     * Set a language as the default
     * @param id Language ID to set as default
     * @returns The updated language entity
     */
    async setAsDefault(id: string): Promise<LanguageEntity> {
        // First, set all languages as non-default
        await this.languageRepo.createQueryBuilder()
            .update(LanguageEntity)
            .set({ isDefault: false })
            .execute();
        
        // Then set the specified language as default
        const language = await this.findById(id);
        language.isDefault = true;
        
        const result = await this.languageRepo.save(language);
        
        // Invalidate cache
        this.invalidateDefaultLanguageCache();
        
        return result;
    }

    /**
     * Get the default language
     * Using memory cache to reduce database queries
     * @returns The default language entity
     * @throws NotFoundException if no default language found
     */
    async getDefaultLanguage(): Promise<LanguageEntity> {
        // Check if we have a cached result that's still valid
        const now = Date.now();
        if (this.cachedDefaultLanguage && (now - this.defaultLanguageCacheTime < this.CACHE_TTL)) {
            return this.cachedDefaultLanguage;
        }
        
        const language = await this.languageRepo.findOne({ 
            where: { isDefault: true },
            cache: true
        });
        
        if (!language) {
            throw new NotFoundException('No default language found');
        }
        
        // Cache the result
        this.cachedDefaultLanguage = language;
        this.defaultLanguageCacheTime = now;
        
        return language;
    }
    
    /**
     * Invalidate the default language cache
     * @private
     */
    private invalidateDefaultLanguageCache(): void {
        this.cachedDefaultLanguage = null;
        this.defaultLanguageCacheTime = 0;
    }
}