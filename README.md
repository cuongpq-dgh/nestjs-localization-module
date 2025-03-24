# nestjs-localization-module
<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/nestjs-localization-module.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/nestjs-localization-module.svg" alt="Package License" /></a>
</p>

**nestjs-localization-module** là một NestJS dynamic module giúp quản lý localization (dịch thuật) cho ứng dụng NestJS sử dụng PostgreSQL. Module này hỗ trợ:
- Lấy và cập nhật các bản dịch qua API
- Xử lý các missing translations (tự động lưu các key dịch chưa có)
- Hỗ trợ đa namespace để quản lý các nhóm dịch khác nhau
- Tích hợp authentication tùy chọn cho các API localization

## Tính năng

- **Dynamic Module**: Cấu hình thông qua `forRoot()`, cho phép truyền vào các tùy chọn như kết nối cơ sở dữ liệu (TypeORM options) và một guard tùy chọn.
- **Multi-Namespace Support**: Hỗ trợ nhiều namespace để phân chia các bản dịch theo nhóm.
- **Missing Translation API**: Tự động lưu các key dịch chưa có thông qua endpoint POST.
- **Tích hợp Authentication**: Cho phép bảo vệ các API localization thông qua guard tùy chỉnh, hoặc sử dụng một default guard luôn cho phép nếu không cung cấp.

## Cài đặt

Bạn có thể cài đặt module qua npm:

```bash
npm install nestjs-localization-module
```

## Sử dụng

### 1. Cấu hình trong AppModule

Trong dự án NestJS của bạn, import module và cấu hình các tùy chọn thông qua `forRoot()`:

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { TranslationsModule } from 'nestjs-localization-module';
import { YourAuthGuard } from './auth/your-auth.guard'; // (Tùy chọn)

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
      // Nếu muốn bảo vệ các API localization, cung cấp guard tùy chỉnh.
      // Nếu không muốn áp dụng authentication, có thể bỏ qua (module sẽ sử dụng DefaultAuthGuard).
      authGuard: YourAuthGuard, 
    }),
  ],
})
export class AppModule {}
```

> **Lưu ý:** Nếu bạn không muốn sử dụng authentication, không cần cung cấp thuộc tính `authGuard`. Module sẽ tự động sử dụng DefaultAuthGuard (cho phép mọi request).

### 2. Các API Endpoint

Module cung cấp các endpoint sau:

- **GET /translations/:lang/:ns**  
  Lấy toàn bộ bản dịch cho ngôn ngữ và namespace được chỉ định.  
  **Ví dụ:** `GET /translations/en/translation`  
  Trả về JSON dạng:
  ```json
  {
    "hello": "Hello",
    "welcome": "Welcome to our app!"
  }
  ```

- **POST /translations/update**  
  Cập nhật hoặc thêm mới một bản dịch.  
  **Body yêu cầu:** (JSON)
  ```json
  {
    "lang": "en",
    "ns": "translation",
    "key": "hello",
    "value": "Hello, world!"
  }
  ```
  
- **POST /locales/add/:lng/:ns**  
  Endpoint nhận các missing translation được gửi tự động từ client (ví dụ khi sử dụng i18next với `saveMissing: true`).  
  **Ví dụ:** `POST /locales/add/en/translation`  
  **Body yêu cầu:** Một object JSON với các key là các key dịch và giá trị là defaultValue.
  ```json
  {
    "newKey": "newKey"
  }
  ```

### 3. Cấu hình i18next (Phía Client)

Khi sử dụng i18next trên client (ví dụ: ứng dụng React/React Native), bạn có thể cấu hình như sau để tương thích với backend:

```js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import * as RNLocalize from 'react-native-localize';

const language = RNLocalize.getLocales()[0].languageTag.split('-')[0];

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: language,
    fallbackLng: 'en',
    ns: ['translation', 'common'], // Danh sách namespace
    defaultNS: 'translation',
    saveMissing: true, // Kích hoạt gửi missing translations
    backend: {
      loadPath: 'http://your-backend-url/translations/{{lng}}/{{ns}}',
      addPath: 'http://your-backend-url/locales/add/{{lng}}/{{ns}}'
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

## Cấu hình Options

### connectionOptions
Đây là các tùy chọn của TypeORM để kết nối với cơ sở dữ liệu. Bạn có thể truyền vào object như hướng dẫn trong [TypeORM documentation](https://typeorm.io).

### authGuard (tùy chọn)
- **authGuard:** Là lớp guard được backend chủ cung cấp, phải implement interface `CanActivate` của NestJS.
- Nếu không cung cấp, module sẽ sử dụng một default guard luôn cho phép mọi request.

## License

[MIT License](LICENSE)

## Contributing

Nếu bạn có ý kiến đóng góp, vui lòng mở issue hoặc pull request trên repository GitHub của module.
