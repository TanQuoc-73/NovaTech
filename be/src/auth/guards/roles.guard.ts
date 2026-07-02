import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { AuthService } from '../auth.service';
import type { AuthenticatedUser, UserRole } from '../auth.types';
import { ROLES_KEY } from '../decorators/roles.decorator';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new ForbiddenException('Authenticated user is required.');
    }

    const profile = await this.authService.getProfile(request.user.id);

    if (!roles.includes(profile.role)) {
      throw new ForbiddenException('You do not have permission.');
    }

    return true;
  }
}
