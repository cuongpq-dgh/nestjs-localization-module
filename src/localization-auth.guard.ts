import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Observable, isObservable, lastValueFrom } from 'rxjs';
import { AUTH_GUARD_TOKEN } from './translations.module';

@Injectable()
export class LocalizationAuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_GUARD_TOKEN) private readonly authGuard: CanActivate | null,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.authGuard) {
      // Nếu authGuard không được cung cấp, cho phép request
      return true;
    }
    const result = this.authGuard.canActivate(context);
    if (isObservable(result)) {
      return await lastValueFrom(result);
    }
    return result as boolean | Promise<boolean>;
  }
}
