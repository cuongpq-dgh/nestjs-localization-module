import { Module, DynamicModule, Provider } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Translation } from './translations.entity';
import { TranslationsService } from './translations.service';
import { TranslationsController } from './translations.controller';

export interface TranslationsModuleOptions {
  connectionOptions?: TypeOrmModuleOptions;
  /**
   * authGuard: class guard do backend chủ cung cấp,
   * phải implements CanActivate.
   */
  authGuard: any;
}

export const AUTH_GUARD_TOKEN = 'AUTH_GUARD_TOKEN';

@Module({})
export class TranslationsModule {
  static forRoot(options: TranslationsModuleOptions): DynamicModule {
    if (!options.authGuard) {
      throw new Error('AuthGuard must be provided in TranslationsModule options.');
    }

    const imports = [];
    const providers: Provider[] = [];

    // Nếu có connectionOptions, tự quản lý kết nối DB
    if (options.connectionOptions) {
      imports.push(TypeOrmModule.forRoot(options.connectionOptions));
    }

    // Đăng ký entity của localization
    imports.push(TypeOrmModule.forFeature([Translation]));

    // Cung cấp authGuard qua injection token
    providers.push({
      provide: AUTH_GUARD_TOKEN,
      useValue: options.authGuard,
    });

    return {
      module: TranslationsModule,
      imports,
      providers: [
        ...providers,
        TranslationsService,
      ],
      controllers: [TranslationsController],
      exports: [TranslationsService],
    };
  }
}
