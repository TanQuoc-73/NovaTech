import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import type { AuthenticatedUser } from '../auth.types';
import { SupabaseService } from '../../infrastructure/supabase/supabase.service';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token.');
    }

    const { data, error } = await this.supabaseService.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired bearer token.');
    }

    request.user = data.user;

    return true;
  }

  private extractBearerToken(request: Request) {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return undefined;
    }

    const [scheme, token] = authorization.split(' ');

    return scheme === 'Bearer' ? token : undefined;
  }
}
