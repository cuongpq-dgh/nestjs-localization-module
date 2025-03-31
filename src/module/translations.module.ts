import { Module, DynamicModule, Provider, Global } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TranslationEntity } from '../entities/translations.entity';
import { LanguageEntity } from '../entities/language.entity';
import { ThirdPartyConfigEntity } from '../entities/third-party-config.entity';
import { LocalizationAuthGuard } from '../guards/localization-auth.guard';
import { TranslationsService } from '../services/translations.service';
import { TranslationsController } from '../controllers/translations.controller';
import { ThirdPartyConfigService } from '../services/third-party-config.service';
import { MicrosoftTranslatorService } from '../services/microsoft-translator.service';
import { LanguageService } from '../services/language.service';
import { LanguageController } from '../controllers/language.controller';
import { ThirdPartyConfigController } from '../controllers/third-party-config.controller';

export interface TranslationsModuleOptions {
  connectionOptions?: TypeOrmModuleOptions;
  authGuard?: new (...args: any[]) => any;
  useExistingConnection?: boolean;
  connectionName?: string;
}

export const AUTH_GUARD_TOKEN = 'AUTH_GUARD_TOKEN';
export const CONNECTION_NAME_TOKEN = 'CONNECTION_NAME_TOKEN';

@Global() // Make it globally available to avoid connection name issues
@Module({})
export class TranslationsModule {
  static forRoot(options: TranslationsModuleOptions): DynamicModule {
    // Default connection name
    const connectionName = options?.connectionName || 'default';
    
    // Đảm bảo rằng entities được khai báo trong connectionOptions
    if (options?.connectionOptions && !options.useExistingConnection) {
      options.connectionOptions = {
        ...options.connectionOptions,
        entities: options.connectionOptions.entities || [
          TranslationEntity,
          LanguageEntity, 
          ThirdPartyConfigEntity
        ],
        name: connectionName,
      };
    }

    const imports = [
      // Chỉ import TypeOrmModule.forRoot nếu có connectionOptions và không sử dụng connection hiện có
      ...(options?.connectionOptions && !options.useExistingConnection 
        ? [TypeOrmModule.forRoot(options.connectionOptions)] 
        : []),
      // Luôn import TypeOrmModule.forFeature với các entity của module
      TypeOrmModule.forFeature([
        TranslationEntity,
        LanguageEntity,
        ThirdPartyConfigEntity
      ], connectionName),
    ];

    const providers: Provider[] = [
      // Provide connection name token
      {
        provide: CONNECTION_NAME_TOKEN,
        useValue: connectionName,
      },
      // Đăng ký authGuard nếu được cung cấp, nếu không thì sử dụng null
      {
        provide: AUTH_GUARD_TOKEN,
        useClass: options?.authGuard || LocalizationAuthGuard,
      },
      LocalizationAuthGuard,
      TranslationsService,
      ThirdPartyConfigService,
      MicrosoftTranslatorService,
      LanguageService
    ];

    return {
      global: true, // Make the module globally available
      module: TranslationsModule,
      imports,
      providers,
      controllers: [
        TranslationsController, 
        LanguageController, 
        ThirdPartyConfigController
      ],
      exports: [
        TranslationsService, 
        LanguageService, 
        ThirdPartyConfigService,
        CONNECTION_NAME_TOKEN // Make sure we export the token
      ],
    };
  }

  static register(connectionName?: string): DynamicModule {
    connectionName = connectionName || 'default';
    
    return {
      module: TranslationsModule,
      imports: [
        TypeOrmModule.forFeature([
          LanguageEntity,
          ThirdPartyConfigEntity,
          TranslationEntity,
        ], connectionName),
      ],
      providers: [
        // Provide connection name for services
        {
          provide: CONNECTION_NAME_TOKEN,
          useValue: connectionName,
        },
        LanguageService,
        ThirdPartyConfigService,
        TranslationsService,
        MicrosoftTranslatorService,
      ],
      controllers: [
        LanguageController,
        ThirdPartyConfigController,
        TranslationsController,
      ],
      exports: [
        TypeOrmModule,
        LanguageService,
        ThirdPartyConfigService,
        TranslationsService,
        MicrosoftTranslatorService,
        CONNECTION_NAME_TOKEN
      ],
    };
  }
}
