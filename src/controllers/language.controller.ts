import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, HttpCode, HttpStatus, Inject, Optional } from '@nestjs/common';
import { LanguageService } from '../services/language.service';
import { CreateLanguageDto } from '../dtos/language/create-language.dto';
import { UpdateLanguageDto } from '../dtos/language/update-language.dto';
import { LocalizationAuthGuard } from '../guards/localization-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { LanguageEntity } from '../entities/language.entity';
import { Repository } from 'typeorm';
import { CONNECTION_NAME_TOKEN } from '../module/translations.module';

@Controller('languages')
@UseGuards(LocalizationAuthGuard)
export class LanguageController {
  constructor(
    private readonly languageService: LanguageService,
    @InjectRepository(LanguageEntity)
    private readonly languageRepo: Repository<LanguageEntity>,
    @Optional() @Inject(CONNECTION_NAME_TOKEN) private readonly connectionName?: string,
  ) {}

  // Add diagnostic endpoint to verify entity registration
  @Get('health-check')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    const count = await this.languageRepo.count();
    return {
      status: 'ok',
      entityCount: count,
      entityName: this.languageRepo.metadata.name,
      tableName: this.languageRepo.metadata.tableName
    };
  }

  @Post()
  create(@Body() createDto: CreateLanguageDto) {
    return this.languageService.create(createDto);
  }

  @Get()
  findAll(@Query('active') active?: boolean) {
    return this.languageService.findAll(active);
  }

  @Get('id/:id')
  findById(@Param('id') id: string) {
    return this.languageService.findById(id);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.languageService.findByCode(code);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateLanguageDto) {
    return this.languageService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.languageService.remove(id);
  }

  @Put(':id/set-default')
  setAsDefault(@Param('id') id: string) {
    return this.languageService.setAsDefault(id);
  }

  @Get('default')
  getDefaultLanguage() {
    return this.languageService.getDefaultLanguage();
  }
}
