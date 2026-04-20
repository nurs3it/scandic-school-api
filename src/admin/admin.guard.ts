import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

const SESSION_KEY = 'scandic_admin';

export function isAuthenticated(req: Request): boolean {
  return (req.cookies as Record<string, string>)?.[SESSION_KEY] === 'true';
}

export { SESSION_KEY };

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    if (!isAuthenticated(req)) {
      res.redirect('/admin/login');
      return false;
    }
    return true;
  }
}
