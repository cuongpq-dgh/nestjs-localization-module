import { Module, DynamicModule, Provider } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TranslationEntity } from '../entities/translations.entity'; 
import { TranslationsService } from '../services/translations.service';
import { TranslationsController } from '../controllers/translations.controller';
import { LocalizationAuthGuard } from '../localization-auth.guard';
import { LanguageEntity } from '../entities/language.entity';
import { ThirdPartyConfigEntity } from '../entities/third-party-config.entity';
import { CategoryEntity } from '../entities/category.entity';
import { LanguageService } from '../services/language.service';
import { ThirdPartyConfigService } from '../services/third-party-config.service';
import { CategoryService } from '../services/category.service';
import { MicrosoftTranslatorService } from '../services/microsoft-translator.service';
import { ThirdPartyConfigController } from '../controllers/third-party-config.controller';
import { CategoryController } from '../controllers/category.controller';

export interface TranslationsModuleOptions {
  connectionOptions?: TypeOrmModuleOptions;
  authGuard?: new (...args: any[]) => any;
}

export const AUTH_GUARD_TOKEN = 'AUTH_GUARD_TOKEN';

@Module({})
export class TranslationsModule {
  static forRoot(options: TranslationsModuleOptions): DynamicModule {
    const imports = [];
    const providers: Provider[] = [];

    // Configure database connection
    if (options?.connectionOptions) {
      imports.push(TypeOrmModule.forRoot(options.connectionOptions));
    }
    
    // Register localization entities
    imports.push(TypeOrmModule.forFeature([
      TranslationEntity,
      LanguageEntity,
      ThirdPartyConfigEntity,
      CategoryEntity
    ]));

    // Configure auth guard
    if (options.authGuard) {
      providers.push({
        provide: AUTH_GUARD_TOKEN,
        useClass: options.authGuard,
      });
    } else {
      providers.push({
        provide: AUTH_GUARD_TOKEN,
        useValue: null,
      });
    }

    return {
      module: TranslationsModule,
      imports,
      providers: [
        ...providers,
        LocalizationAuthGuard, 
        TranslationsService,
        LanguageService,
        ThirdPartyConfigService,
        CategoryService,
        MicrosoftTranslatorService,
      ],
      controllers: [
        TranslationsController,
        ThirdPartyConfigController,
        CategoryController,
      ],
      exports: [
        TranslationsService,
        LanguageService,
        ThirdPartyConfigService,
        CategoryService,
        MicrosoftTranslatorService,
      ],
    };
  }
}
