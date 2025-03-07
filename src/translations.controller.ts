import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { UpdateTranslationDto } from './translations.dto';
import { LocalizationAuthGuard } from './localization-auth.guard';

@Controller('translations')
@UseGuards(LocalizationAuthGuard)
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Get(':lang')
  getTranslations(@Param('lang') lang: string) {
    return this.translationsService.getTranslations(lang);
  }

  @Post('update')
  updateTranslation(@Body() dto: UpdateTranslationDto) {
    return this.translationsService.updateTranslation(dto);
  }
}
