import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { UpdateTranslationDto } from './translations.dto';
import { LocalizationAuthGuard } from './localization-auth.guard';
import { MissingTranslationDto } from './missing-translation.dto';

@Controller('translations')
@UseGuards(LocalizationAuthGuard)
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) { }

  @Get(':lang/:ns')
  getTranslations(@Param('lang') lang: string, @Param('ns') ns: string) {
    return this.translationsService.getTranslations(lang, ns);
  }

  @Post('update')
  updateTranslation(@Body() dto: UpdateTranslationDto) {
    return this.translationsService.updateTranslation(dto);
  }

  @Post('add/:lng/:ns')
  async addMissingTranslations(
    @Param('lng') lng: string,
    @Param('ns') ns: string,
    @Body() missingKeys: Record<string, string>,
  ) {
    for (const key in missingKeys) {
      const defaultValue = missingKeys[key];
      await this.translationsService.addMissingTranslation({
        lang: lng,
        ns: ns,
        key,
        defaultValue: defaultValue || key,
      });
    }
    return { success: true };
  }
}
