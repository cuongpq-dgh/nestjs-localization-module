import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { LanguageService } from '../services/language.service';
import { CreateLanguageDto } from '../dtos/language/create-language.dto';
import { UpdateLanguageDto } from '../dtos/language/update-language.dto';
import { LocalizationAuthGuard } from '../localization-auth.guard';

@Controller('languages')
@UseGuards(LocalizationAuthGuard)
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

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
