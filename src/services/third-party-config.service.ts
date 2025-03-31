import { Injectable, NotFoundException, Logger, Inject, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ThirdPartyConfigEntity } from '../entities/third-party-config.entity';
import { UpdateThirdPartyConfigDto } from '../dtos/third-party-config/update-third-party-config.dto';
import { FilterThirdPartyConfigDto } from '../dtos/third-party-config/filter-third-party-config.dto';
import { CreateThirdPartyConfigDto } from '../dtos/third-party-config/create-third-party-config.dto';
import { CONNECTION_NAME_TOKEN } from '../module/translations.module';

@Injectable()
export class ThirdPartyConfigService {
  private readonly logger = new Logger(ThirdPartyConfigService.name);
  
  // Add in-memory cache for frequently accessed configs
  private configCache: Map<string, { data: ThirdPartyConfigEntity, timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
  
  constructor(
    @InjectRepository(ThirdPartyConfigEntity)
    private readonly thirdPartyConfigRepo: Repository<ThirdPartyConfigEntity>,
    @Optional() @Inject(CONNECTION_NAME_TOKEN) private readonly connectionName?: string,
  ) {}

  /**
   * Create a new third party configuration
   * @param createDto Configuration data to create
   * @returns The created configuration entity
   */
  async create(createDto: CreateThirdPartyConfigDto): Promise<ThirdPartyConfigEntity> {
    try {
      const config = this.thirdPartyConfigRepo.create(createDto);
      const result = await this.thirdPartyConfigRepo.save(config);
      
      // Invalidate cache for this code if it exists
      this.invalidateCache(createDto.code);
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to create config: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Find all configurations with optional filtering
   * @param filterDto Optional filter criteria
   * @returns Array of configuration entities
   */
  async findAll(filterDto?: FilterThirdPartyConfigDto): Promise<ThirdPartyConfigEntity[]> {
    try {
      const query = this.thirdPartyConfigRepo.createQueryBuilder('config');
      
      if (filterDto) {
        if (filterDto.code) {
          query.andWhere('config.code LIKE :code', { code: `%${filterDto.code}%` });
        }
        
        if (filterDto.type) {
          query.andWhere('config.type = :type', { type: filterDto.type });
        }
        
        if (filterDto.group) {
          query.andWhere('config.group = :group', { group: filterDto.group });
        }
      }
      
      // Add caching for frequently used queries
      if (filterDto?.type || filterDto?.group) {
        query.cache(true);
      }
      
      return await query.getMany();
    } catch (error) {
      this.logger.error(`Error finding configs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Find a configuration by its ID
   * @param id Configuration ID
   * @returns The found configuration entity
   * @throws NotFoundException if configuration not found
   */
  async findById(id: string): Promise<ThirdPartyConfigEntity> {
    try {
      const config = await this.thirdPartyConfigRepo.findOne({ 
        where: { id },
        cache: true
      });
      
      if (!config) {
        throw new NotFoundException(`Configuration with ID ${id} not found`);
      }
      
      return config;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error finding config by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Find a configuration by its code
   * Uses memory cache to reduce database calls
   * @param code Configuration code
   * @returns The found configuration entity
   * @throws NotFoundException if configuration not found
   */
  async findByCode(code: string): Promise<ThirdPartyConfigEntity> {
    try {
      // Check cache first
      const cachedItem = this.configCache.get(code);
      if (cachedItem && (Date.now() - cachedItem.timestamp < this.CACHE_TTL)) {
        return cachedItem.data;
      }
      
      const config = await this.thirdPartyConfigRepo.findOne({ 
        where: { code },
        cache: true
      });
      
      if (!config) {
        throw new NotFoundException(`Configuration with code ${code} not found`);
      }
      
      // Store in memory cache
      this.configCache.set(code, {
        data: config,
        timestamp: Date.now()
      });
      
      return config;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error finding config by code: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Find configurations by group
   * @param group Configuration group
   * @returns Array of configuration entities
   */
  async findByGroup(group: string): Promise<ThirdPartyConfigEntity[]> {
    try {
      return await this.thirdPartyConfigRepo.find({ 
        where: { group },
        cache: true
      });
    } catch (error) {
      this.logger.error(`Error finding configs by group: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Find configurations by type
   * @param type Configuration type
   * @returns Array of configuration entities
   */
  async findByType(type: string): Promise<ThirdPartyConfigEntity[]> {
    try {
      return await this.thirdPartyConfigRepo.find({ 
        where: { type },
        cache: true
      });
    } catch (error) {
      this.logger.error(`Error finding configs by type: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Find multiple configurations by their codes
   * Optimized to fetch all in a single query
   * @param codes Array of configuration codes
   * @returns Map of code to configuration entity
   */
  async findByCodes(codes: string[]): Promise<Map<string, ThirdPartyConfigEntity>> {
    try {
      if (!codes || codes.length === 0) {
        return new Map();
      }
      
      // Get all configs in one query
      const configs = await this.thirdPartyConfigRepo.find({
        where: { code: In(codes) },
        cache: true
      });
      
      // Build a map for easy lookup
      const configMap = new Map<string, ThirdPartyConfigEntity>();
      configs.forEach(config => {
        configMap.set(config.code, config);
        
        // Also update the cache
        this.configCache.set(config.code, {
          data: config,
          timestamp: Date.now()
        });
      });
      
      return configMap;
    } catch (error) {
      this.logger.error(`Error finding configs by codes: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Update a configuration by ID
   * @param id Configuration ID
   * @param updateDto Updated configuration data
   * @returns The updated configuration entity
   * @throws NotFoundException if configuration not found
   */
  async update(id: string, updateDto: UpdateThirdPartyConfigDto): Promise<ThirdPartyConfigEntity> {
    try {
      const config = await this.findById(id);
      
      // Track if the code is changing
      const oldCode = config.code;
      
      // Update the configuration properties
      Object.assign(config, updateDto);
      
      // Save the changes
      const result = await this.thirdPartyConfigRepo.save(config);
      
      // Invalidate cache for both old and new codes if they differ
      this.invalidateCache(oldCode);
      if (oldCode !== result.code) {
        this.invalidateCache(result.code);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Error updating config: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Remove a configuration by ID
   * @param id Configuration ID
   * @returns Boolean indicating success
   * @throws NotFoundException if configuration not found
   */
  async remove(id: string): Promise<boolean> {
    try {
      const config = await this.findById(id);
      
      // Store code before removal
      const code = config.code;
      
      const result = await this.thirdPartyConfigRepo.remove(config);
      
      // Invalidate cache
      this.invalidateCache(code);
      
      return !!result;
    } catch (error) {
      this.logger.error(`Error removing config: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Invalidate cache for a specific config code
   * @private
   */
  private invalidateCache(code: string): void {
    this.configCache.delete(code);
  }
}
