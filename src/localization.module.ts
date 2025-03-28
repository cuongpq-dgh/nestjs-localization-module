import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslationsService } from './services/translations.service';
import { TranslationEntity } from './entities/translations.entity';
import { LanguageEntity } from './entities/language.entity';
import { MicrosoftTranslatorService } from './services/microsoft-translator.service';
import { TranslationsController } from './controllers/translations.controller';
import { LanguageService } from './services/language.service';
import { LanguageController } from './controllers/language.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TranslationEntity, LanguageEntity]),
  ],
  controllers: [
    TranslationsController,
    LanguageController,
  ],
  providers: [
    TranslationsService,
    LanguageService,
    MicrosoftTranslatorService
  ],
  exports: [
    TranslationsService,
    LanguageService
  ]
})
export class LocalizationModule {}