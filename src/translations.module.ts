import { Module, DynamicModule, Provider } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Translation } from './translations.entity';
import { TranslationsService } from './translations.service';
import { TranslationsController } from './translations.controller';
import { LocalizationAuthGuard } from './localization-auth.guard';

export interface TranslationsModuleOptions {
  connectionOptions?: TypeOrmModuleOptions;
  // authGuard trở thành tùy chọn
  authGuard?: new (...args: any[]) => any;
}

export const AUTH_GUARD_TOKEN = 'AUTH_GUARD_TOKEN';

@Module({})
export class TranslationsModule {
  static forRoot(options: TranslationsModuleOptions): DynamicModule {
    const imports = [];
    const providers: Provider[] = [];

    if (options?.connectionOptions) {
      imports.push(TypeOrmModule.forRoot(options.connectionOptions));
    }
    // Đăng ký entity của localization
    imports.push(TypeOrmModule.forFeature([Translation]));

    // Nếu authGuard được cung cấp, sử dụng useClass, ngược lại sử dụng null
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
        LocalizationAuthGuard, // Guard trung gian sẽ sử dụng giá trị từ AUTH_GUARD_TOKEN
        TranslationsService,
      ],
      controllers: [TranslationsController],
      exports: [TranslationsService],
    };
  }
}
