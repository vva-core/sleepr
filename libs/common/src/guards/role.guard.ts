import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { User } from '../prisma/generated/prisma';

const matchRoles = (user: User, roles: string[]) => {
  return roles.some((role) => user.roles.includes(role));
};

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log(roles);

    if (!roles) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as User | undefined;

    console.log(user, 'user');

    if (!user) {
      return false;
    }
    const test = matchRoles(user, roles);

    console.log(test);

    return matchRoles(user, roles);
  }
}
