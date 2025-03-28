import { Module } from '@nestjs/common';
import { TranslationsModule } from './module/translations.module';
import { TranslationsController } from './controllers/translations.controller';
import { CategoryController } from './controllers/category.controller';
import { ThirdPartyConfigController } from './controllers/third-party-config.controller';
import { LanguageController } from './controllers/language.controller';
import { TranslationsService } from './services/translations.service';
import { LanguageService } from './services/language.service';
import { MicrosoftTranslatorService } from './services/microsoft-translator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslationEntity } from './entities/translations.entity';
import { LanguageEntity } from './entities/language.entity';
import { CategoryEntity } from './entities/category.entity';
import { ThirdPartyConfigEntity } from './entities/third-party-config.entity';
import { CategoryService } from './services/category.service';
require('dotenv').config()

@Module({
  imports: [
    TranslationsModule.forRoot({
      connectionOptions: {
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        database: process.env.POSTGRES_DB || 'localization_db',
        autoLoadEntities: true,
        synchronize: true,
      },
    }),
    TypeOrmModule.forFeature([TranslationEntity, LanguageEntity, CategoryEntity, ThirdPartyConfigEntity]),
  ],
  controllers: [
    TranslationsController,
    CategoryController,
    ThirdPartyConfigController,
    LanguageController
  ],
    providers: [
      TranslationsService,
      LanguageService,
      MicrosoftTranslatorService,
      CategoryService
    ],
    exports: [
      TranslationsService,
      LanguageService,
      MicrosoftTranslatorService,
      CategoryService
    ]
})
export class AppModule {}
