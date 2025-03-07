import { Module, DynamicModule, Provider } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Translation } from './translations.entity';
import { TranslationsService } from './translations.service';
import { TranslationsController } from './translations.controller';
import { LocalizationAuthGuard } from './localization-auth.guard';

export interface TranslationsModuleOptions {
  connectionOptions?: TypeOrmModuleOptions;
  /**
   * authGuard: lớp guard do backend chủ cung cấp, phải implements CanActivate.
   */
  authGuard: new (...args: any[]) => any;
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

    if (options?.connectionOptions) {
      imports.push(TypeOrmModule.forRoot(options.connectionOptions));
    }
    // Đăng ký entity của localization
    imports.push(TypeOrmModule.forFeature([Translation]));

    // Sử dụng useClass để NestJS tự tạo instance của guard được cung cấp
    providers.push({
      provide: AUTH_GUARD_TOKEN,
      useClass: options.authGuard,
    });

    return {
      module: TranslationsModule,
      imports,
      providers: [
        ...providers,
        LocalizationAuthGuard, // Guard trung gian sử dụng AUTH_GUARD_TOKEN
        TranslationsService,
      ],
      controllers: [TranslationsController],
      exports: [TranslationsService],
    };
  }
}
