import { Injectable, CanActivate, ExecutionContext, Inject, Optional } from '@nestjs/common';
import { Observable, isObservable, lastValueFrom } from 'rxjs';
import { AUTH_GUARD_TOKEN } from './module/translations.module';

@Injectable()
export class LocalizationAuthGuard implements CanActivate {
  constructor(
    @Optional() @Inject(AUTH_GUARD_TOKEN) private readonly authGuard: CanActivate | null,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.authGuard) {
      // Nếu không có authGuard được cung cấp, cho phép tất cả request.
      return true;
    }
    const result = this.authGuard.canActivate(context);
    if (isObservable(result)) {
      return await lastValueFrom(result);
    }
    return result as boolean | Promise<boolean>;
  }
}
