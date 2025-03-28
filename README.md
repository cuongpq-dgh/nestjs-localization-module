# nestjs-localization-module
<p align="center">
  <a href="https://www.npmjs.com/package/nestjs-localization-module" target="_blank"><img src="https://img.shields.io/npm/v/nestjs-localization-module.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/nestjs-localization-module" target="_blank"><img src="https://img.shields.io/npm/l/nestjs-localization-module.svg" alt="Package License" /></a>
</p>

**nestjs-localization-module** là một NestJS dynamic module giúp quản lý localization (dịch thuật) cho ứng dụng NestJS sử dụng PostgreSQL. Module này hỗ trợ:
- Lấy và cập nhật các bản dịch qua API
- Xử lý các translations (tự động lưu các key dịch chưa có)
- Hỗ trợ đa namespace để quản lý các nhóm dịch khác nhau
- Tích hợp authentication tùy chọn cho các API localization
- Quản lý danh mục (categories) để phân loại các bản dịch
- Tự động dịch với Microsoft Translator API
- Theo dõi tiến trình dịch cho từng danh mục

## Tính năng

- **Dynamic Module**: Cấu hình thông qua `forRoot()`, cho phép truyền vào các tùy chọn như kết nối cơ sở dữ liệu (TypeORM options) và một guard tùy chọn.
- **Multi-Namespace Support**: Hỗ trợ nhiều namespace để phân chia các bản dịch theo nhóm.
- **Translation API**: Tự động lưu các key dịch thông qua endpoint POST.
- **Tích hợp Authentication**: Cho phép bảo vệ các API localization thông qua guard tùy chỉnh.
- **Quản lý danh mục**: Phân loại bản dịch theo danh mục, hỗ trợ cấu trúc danh mục phân cấp.
- **Tự động dịch**: Tích hợp với Microsoft Translator API để tự động dịch sang các ngôn ngữ khác.
- **Báo cáo tiến trình**: Theo dõi tiến trình dịch cho từng danh mục và ngôn ngữ.

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
      authGuard: YourAuthGuard, 
    }),
  ],
})
export class AppModule {}
```

#### Cấu hình nâng cao

Bạn có thể cung cấp các tùy chọn thêm:

```typescript
TranslationsModule.forRoot({
  connectionOptions: {
    // TypeORM options...
  },
  authGuard: YourAuthGuard,
  apiPrefix: 'api/v1', // Tùy chọn tiền tố cho các routes
  cache: {
    ttl: 60 * 5, // Thời gian cache (giây)
  },
  defaultLanguage: 'vi', // Ngôn ngữ mặc định
})
```

### 2. Cấu hình Microsoft Translator (Tùy chọn)

Để sử dụng tính năng tự động dịch, bạn cần thêm thông tin cấu hình Microsoft Translator API vào cơ sở dữ liệu:

1. Tạo tài khoản Microsoft Azure và đăng ký dịch vụ Translator
2. Lấy API key và region
3. Thêm cấu hình vào bảng `nlm_third_party_config`:
   - Thêm mục với code: `MICROSOFT_TRANSLATOR_API_KEY`, value: API key của bạn
   - Thêm mục với code: `MICROSOFT_TRANSLATOR_REGION`, value: Region của bạn (vd: 'eastus')

**Ví dụ cấu hình thông qua API:**

```http
POST /third-party-config
Content-Type: application/json

{
  "code": "MICROSOFT_TRANSLATOR_API_KEY",
  "name": "Microsoft Translator API Key",
  "type": "API_KEY",
  "value": "your-azure-api-key",
  "group": "TRANSLATOR"
}
```

Tiếp theo, thiết lập region:

```http
POST /third-party-config
Content-Type: application/json

{
  "code": "MICROSOFT_TRANSLATOR_REGION",
  "name": "Microsoft Translator Region",
  "type": "CONFIG",
  "value": "eastasia",
  "group": "TRANSLATOR"
}
```

### 3. Các API Endpoint

Module cung cấp các nhóm endpoint sau:

#### Translations API

- **GET /translations/:lang/:ns**  
  Lấy toàn bộ bản dịch cho ngôn ngữ và namespace được chỉ định.  
  Query params: `categoryId` (tùy chọn) để lọc theo danh mục.
  
  **Ví dụ Request:**
  ```http
  GET /translations/vi/common
  ```
  
  **Ví dụ Response:**
  ```json
  {
    "welcome": "Xin chào",
    "login": "Đăng nhập",
    "register": "Đăng ký",
    "profile": "Thông tin cá nhân",
    "button.save": "Lưu",
    "button.cancel": "Hủy"
  }
  ```

- **GET /translations**  
  Lấy danh sách bản dịch với bộ lọc tùy chọn.  
  Query params: `key`, `lang`, `ns`, `categoryId`.
  
  **Ví dụ Request:**
  ```http
  GET /translations?lang=vi&ns=common
  ```
  
  **Ví dụ Response:**
  ```json
  [
    {
      "id": "B1xn4JvtPqBs3MmP6xMme",
      "key": "welcome",
      "value": "Xin chào",
      "ns": "common",
      "lang": {
        "id": "L1xn4JkaLB3M45P6xkn2",
        "code": "vi",
        "name": "Tiếng Việt",
        "active": true,
        "isDefault": false
      }
    },
    {
      "id": "B1xn4JvtPqBs3MmP6xnk2",
      "key": "login",
      "value": "Đăng nhập",
      "ns": "common",
      "lang": {
        "id": "L1xn4JkaLB3M45P6xkn2",
        "code": "vi",
        "name": "Tiếng Việt",
        "active": true,
        "isDefault": false
      }
    }
  ]
  ```

- **POST /translations**  
  Tạo một bản dịch mới.  
  Body: `{ key, value, lang, ns?, categoryId? }`
  
  **Ví dụ Request:**
  ```http
  POST /translations
  Content-Type: application/json
  
  {
    "key": "greeting",
    "value": "Xin chào bạn",
    "lang": "vi",
    "ns": "common",
    "categoryId": "C1xn4JvtPqBs3MmP6xMme"
  }
  ```
  
  **Ví dụ Response:**
  ```json
  {
    "id": "B1xn4JvtPqBs3MmP6xn45",
    "key": "greeting",
    "value": "Xin chào bạn",
    "ns": "common",
    "categoryId": "C1xn4JvtPqBs3MmP6xMme",
    "lang": {
      "id": "L1xn4JkaLB3M45P6xkn2",
      "code": "vi",
      "name": "Tiếng Việt"
    }
  }
  ```

- **PUT /translations**  
  Cập nhật một bản dịch.  
  Body: `{ key, value, lang, ns?, categoryId? }`
  
  **Ví dụ Request:**
  ```http
  PUT /translations
  Content-Type: application/json
  
  {
    "key": "greeting",
    "value": "Xin chào quý khách",
    "lang": "vi",
    "ns": "common"
  }
  ```
  
  **Ví dụ Response:**
  ```json
  {
    "id": "B1xn4JvtPqBs3MmP6xn45",
    "key": "greeting",
    "value": "Xin chào quý khách",
    "ns": "common",
    "categoryId": "C1xn4JvtPqBs3MmP6xMme",
    "lang": {
      "id": "L1xn4JkaLB3M45P6xkn2",
      "code": "vi",
      "name": "Tiếng Việt"
    }
  }
  ```

- **DELETE /translations/:id**  
  Xóa một bản dịch theo ID.
  
  **Ví dụ Request:**
  ```http
  DELETE /translations/B1xn4JvtPqBs3MmP6xn45
  ```
  
  **Ví dụ Response:**
  ```json
  true
  ```

- **POST /translations/add-translation**  
  Thêm một bản dịch.  
  Body: `{ key, lang, ns?, defaultValue?, categoryId? }`
  
  **Ví dụ Request:**
  ```http
  POST /translations/add-translation
  Content-Type: application/json
  
  {
    "key": "common.newKey",
    "lang": "en",
    "ns": "translation",
    "categoryId": "C1xn4JvtPqBs3MmP6xMme"
  }
  ```
  
  **Ví dụ Response:**
  ```json
  {
    "id": "B1xnFJvtPqBs3MmP6xa12",
    "key": "common.newKey",
    "value": "common.newKey",
    "ns": "translation",
    "categoryId": "C1xn4JvtPqBs3MmP6xMme",
    "lang": {
      "id": "L1xn4JkaLB3M45P6xkn1",
      "code": "en",
      "name": "English"
    }
  }
  ```

- **POST /translations/add-many/:lng/:ns**  
  Thêm nhiều bản dịch cùng lúc.  
  Path params: `lng` (language code), `ns` (namespace)  
  Query params: `categoryId` (tùy chọn)  
  Body: Object với key-value là các bản dịch cần thêm.
  
  **Ví dụ Request:**
  ```http
  POST /translations/add-many/en/common?categoryId=C1xn4JvtPqBs3MmP6xMme
  Content-Type: application/json
  
  {
    "button.submit": "Submit",
    "button.reset": "Reset",
    "button.next": "Next"
  }
  ```
  
  **Ví dụ Response:**
  ```json
  3
  ```

- **POST /translations/batch-translate**  
  Dịch hàng loạt nhiều văn bản.  
  Body: `{ texts: string[], targetLang: string, sourceLang?: string }`
  
  **Ví dụ Request:**
  ```http
  POST /translations/batch-translate
  Content-Type: application/json
  
  {
    "texts": [
      "Hello",
      "How are you?",
      "Welcome to our application"
    ],
    "targetLang": "vi",
    "sourceLang": "en"
  }
  ```
  
  **Ví dụ Response:**
  ```json
  [
    {
      "key": "Hello",
      "value": "Xin chào"
    },
    {
      "key": "How are you?",
      "value": "Bạn khỏe không?"
    },
    {
      "key": "Welcome to our application",
      "value": "Chào mừng đến với ứng dụng của chúng tôi"
    }
  ]
  ```

#### Languages API

- **GET /languages**  
  Lấy danh sách tất cả ngôn ngữ.  
  Query params: `active` (tùy chọn, boolean)
  
  **Ví dụ Request:**
  ```http
  GET /languages?active=true
  ```
  
  **Ví dụ Response:**
  ```json
  [
    {
      "id": "L1xn4JkaLB3M45P6xkn1",
      "code": "en",
      "name": "English",
      "active": true,
      "isDefault": true,
      "flagIcon": "gb"
    },
    {
      "id": "L1xn4JkaLB3M45P6xkn2",
      "code": "vi",
      "name": "Tiếng Việt",
      "active": true,
      "isDefault": false,
      "flagIcon": "vn"
    }
  ]
  ```

- **GET /languages/default**  
  Lấy ngôn ngữ mặc định.
  
  **Ví dụ Response:**
  ```json
  {
    "id": "L1xn4JkaLB3M45P6xkn1",
    "code": "en",
    "name": "English",
    "active": true,
    "isDefault": true,
    "flagIcon": "gb"
  }
  ```

- **POST /languages**  
  Tạo mới ngôn ngữ.  
  Body: `{ code, name, active?, isDefault?, flagIcon? }`
  
  **Ví dụ Request:**
  ```http
  POST /languages
  Content-Type: application/json
  
  {
    "code": "fr",
    "name": "Français",
    "active": true,
    "isDefault": false,
    "flagIcon": "fr"
  }
  ```
  
  **Ví dụ Response:**
  ```json
  {
    "id": "L1xn4JkaLB3M45P6xkn3",
    "code": "fr",
    "name": "Français",
    "active": true,
    "isDefault": false,
    "flagIcon": "fr"
  }
  ```

#### Categories API

- **GET /categories**  
  Lấy danh sách tất cả danh mục.
  
  **Ví dụ Response:**
  ```json
  [
    {
      "id": "C1xn4JvtPqBs3MmP6xMme",
      "name": "General",
      "description": "General translations",
      "slug": "general",
      "parentId": null
    },
    {
      "id": "C2xn4JvtPqBs3MmP6xMmf",
      "name": "Dashboard",
      "description": "Dashboard translations",
      "slug": "dashboard",
      "parentId": null
    }
  ]
  ```

- **GET /categories/:id/progress**  
  Lấy thông tin tiến trình dịch cho danh mục.  
  Query params: `lang` (tùy chọn) để xem tiến trình cho một ngôn ngữ cụ thể.
  
  **Ví dụ Request:**
  ```http
  GET /categories/C1xn4JvtPqBs3MmP6xMme/progress
  ```
  
  **Ví dụ Response:**
  ```json
  {
    "categoryId": "C1xn4JvtPqBs3MmP6xMme",
    "categoryName": "General",
    "totalKeys": 24,
    "languageProgress": [
      {
        "language": {
          "id": "L1xn4JkaLB3M45P6xkn1",
          "code": "en",
          "name": "English"
        },
        "translatedCount": 24,
        "percentage": 100
      },
      {
        "language": {
          "id": "L1xn4JkaLB3M45P6xkn2",
          "code": "vi",
          "name": "Tiếng Việt"
        },
        "translatedCount": 18,
        "percentage": 75
      }
    ]
  }
  ```

### 4. Cấu hình i18next (Phía Client)

Khi sử dụng i18next trên client, bạn có thể cấu hình để tương thích với backend:

#### React.js

```js
// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: 'vi',
    fallbackLng: 'en',
    ns: ['translation', 'common'],
    defaultNS: 'translation',
    saveMissing: true,
    backend: {
      loadPath: 'http://your-backend-url/translations/{{lng}}/{{ns}}',
      addPath: 'http://your-backend-url/translations/add-many/{{lng}}/{{ns}}'
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

#### Sử dụng trong component

```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('greeting')}</p>
      <button>{t('button.save')}</button>
      
      <div>
        <button onClick={() => i18n.changeLanguage('en')}>English</button>
        <button onClick={() => i18n.changeLanguage('vi')}>Tiếng Việt</button>
      </div>
    </div>
  );
}
```

#### Angular ngx-translate

```typescript
// app.module.ts
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(
    http, 
    'http://your-backend-url/translations/', 
    '/'
  );
}

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      defaultLanguage: 'vi',
    })
  ],
})
export class AppModule {
  constructor(translate: TranslateService) {
    translate.addLangs(['en', 'vi']);
    translate.setDefaultLang('vi');
  }
}
```

### 5. Workflow Tích hợp

#### Quy trình làm việc với module

1. **Cài đặt và cấu hình module** trong dự án NestJS
2. **Tạo các ngôn ngữ** cho ứng dụng (ít nhất một ngôn ngữ mặc định)
3. **Tạo các danh mục** (tùy chọn) để phân loại bản dịch
4. **Thêm bản dịch** cho ngôn ngữ mặc định
5. **Cấu hình Microsoft Translator API** (tùy chọn) để hỗ trợ auto-translate
6. **Tích hợp front-end** với các API của module

#### Quy trình localization tự động

1. Front-end sử dụng i18next để hiển thị các bản dịch
2. Khi có key mới chưa được dịch, i18next gọi API `add-translation` hoặc `add-many`
3. Backend lưu key mới và tự động dịch sang các ngôn ngữ khác (nếu đã cấu hình Microsoft Translator)
4. Front-end tải lại bản dịch khi người dùng chuyển ngôn ngữ

### 6. Cấu trúc dữ liệu

Module sử dụng TypeORM với các entity sau:
